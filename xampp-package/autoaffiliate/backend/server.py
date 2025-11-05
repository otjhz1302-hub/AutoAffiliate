from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import httpx
from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
from concurrent.futures import ThreadPoolExecutor

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Scheduler
scheduler = BackgroundScheduler()
executor = ThreadPoolExecutor(max_workers=3)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= Models =============

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: Dict[str, Any]

class IntegrationConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rapidapi_key: Optional[str] = None
    rapidapi_host: Optional[str] = "amazon23.p.rapidapi.com"
    amazon_affiliate_tag: Optional[str] = None
    instagram_access_token: Optional[str] = None
    instagram_user_id: Optional[str] = None
    facebook_access_token: Optional[str] = None
    facebook_page_id: Optional[str] = None
    pinterest_access_token: Optional[str] = None
    google_analytics_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SchedulerConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = False
    posts_per_day: int = 3
    post_times: List[str] = ["09:00", "14:00", "19:00"]
    platforms: List[str] = ["instagram"]
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    asin: str
    title: str
    description: Optional[str] = None
    price: Optional[str] = None
    image_url: Optional[str] = None
    product_url: str
    affiliate_url: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    category: Optional[str] = None
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    product_title: str
    product_image: str
    caption: str
    hashtags: str
    platform: str
    status: str = "pending"  # pending, posted, failed
    platform_post_id: Optional[str] = None
    error_message: Optional[str] = None
    scheduled_at: datetime
    posted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Analytics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    total_posts: int = 0
    instagram_posts: int = 0
    facebook_posts: int = 0
    pinterest_posts: int = 0
    successful_posts: int = 0
    failed_posts: int = 0
    clicks: int = 0
    impressions: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= Helper Functions =============

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def fetch_amazon_products(rapidapi_key: str, rapidapi_host: str):
    """Fetch top selling products from Amazon via RapidAPI"""
    try:
        url = f"https://{rapidapi_host}/product-search"
        headers = {
            "X-RapidAPI-Key": rapidapi_key,
            "X-RapidAPI-Host": rapidapi_host
        }
        params = {
            "query": "best sellers",
            "page": "1"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                products = []
                
                results = data.get('results', [])
                for item in results[:10]:  # Get top 10
                    product = Product(
                        asin=item.get('asin', ''),
                        title=item.get('title', ''),
                        description=item.get('description', ''),
                        price=item.get('price', {}).get('raw', ''),
                        image_url=item.get('image', ''),
                        product_url=item.get('url', ''),
                        rating=item.get('rating', 0),
                        reviews_count=item.get('reviews_count', 0),
                        category=item.get('category', '')
                    )
                    products.append(product)
                
                return products
            else:
                logging.error(f"RapidAPI error: {response.status_code} - {response.text}")
                return []
    except Exception as e:
        logging.error(f"Error fetching Amazon products: {str(e)}")
        return []

async def post_to_instagram(access_token: str, user_id: str, image_url: str, caption: str):
    """Post to Instagram using Graph API"""
    try:
        # Step 1: Create container
        container_url = f"https://graph.facebook.com/v18.0/{user_id}/media"
        container_params = {
            "image_url": image_url,
            "caption": caption,
            "access_token": access_token
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            container_response = await client.post(container_url, data=container_params)
            
            if container_response.status_code != 200:
                return {"success": False, "error": container_response.text}
            
            container_data = container_response.json()
            creation_id = container_data.get('id')
            
            # Step 2: Publish container
            publish_url = f"https://graph.facebook.com/v18.0/{user_id}/media_publish"
            publish_params = {
                "creation_id": creation_id,
                "access_token": access_token
            }
            
            publish_response = await client.post(publish_url, data=publish_params)
            
            if publish_response.status_code == 200:
                publish_data = publish_response.json()
                return {"success": True, "post_id": publish_data.get('id')}
            else:
                return {"success": False, "error": publish_response.text}
                
    except Exception as e:
        logging.error(f"Instagram posting error: {str(e)}")
        return {"success": False, "error": str(e)}

def generate_hashtags(title: str, category: str = "") -> str:
    """Generate relevant hashtags based on product title and category"""
    base_hashtags = ["#AmazonFinds", "#BestDeals", "#Shopping", "#ProductReview", 
                     "#AffiliateMarketing", "#OnlineShopping", "#DailyDeals", 
                     "#BestSellers", "#TrendingNow", "#MustHave"]
    return " ".join(base_hashtags[:10])

async def process_and_post_products():
    """Background job to fetch products and create scheduled posts"""
    try:
        # Get integration config
        config_doc = await db.integration_configs.find_one({}, {"_id": 0})
        if not config_doc:
            logging.warning("No integration config found")
            return
        
        # Get scheduler config
        scheduler_doc = await db.scheduler_configs.find_one({}, {"_id": 0})
        if not scheduler_doc or not scheduler_doc.get('is_active'):
            logging.info("Scheduler is not active")
            return
        
        # Fetch products from Amazon
        rapidapi_key = config_doc.get('rapidapi_key')
        rapidapi_host = config_doc.get('rapidapi_host', 'amazon23.p.rapidapi.com')
        
        if not rapidapi_key:
            logging.warning("RapidAPI key not configured")
            return
        
        products = await fetch_amazon_products(rapidapi_key, rapidapi_host)
        
        if not products:
            logging.warning("No products fetched")
            return
        
        # Save products to database
        for product in products:
            # Add affiliate tag to product URL
            affiliate_tag = config_doc.get('amazon_affiliate_tag', '')
            if affiliate_tag:
                product.affiliate_url = f"{product.product_url}?tag={affiliate_tag}"
            else:
                product.affiliate_url = product.product_url
            
            product_dict = product.model_dump()
            product_dict['fetched_at'] = product_dict['fetched_at'].isoformat()
            await db.products.update_one(
                {"asin": product.asin},
                {"$set": product_dict},
                upsert=True
            )
        
        # Post to Instagram
        instagram_token = config_doc.get('instagram_access_token')
        instagram_user_id = config_doc.get('instagram_user_id')
        
        posts_per_day = scheduler_doc.get('posts_per_day', 3)
        selected_products = products[:posts_per_day]
        
        for product in selected_products:
            caption = f"{product.title}\n\n"
            if product.description:
                caption += f"{product.description[:100]}...\n\n"
            caption += f"Link in bio! 🛒\n\n"
            
            hashtags = generate_hashtags(product.title, product.category or "")
            caption += hashtags
            
            if instagram_token and instagram_user_id:
                result = await post_to_instagram(
                    instagram_token,
                    instagram_user_id,
                    product.image_url,
                    caption
                )
                
                post = Post(
                    product_id=product.id,
                    product_title=product.title,
                    product_image=product.image_url,
                    caption=caption,
                    hashtags=hashtags,
                    platform="instagram",
                    status="posted" if result.get('success') else "failed",
                    platform_post_id=result.get('post_id'),
                    error_message=result.get('error'),
                    scheduled_at=datetime.now(timezone.utc),
                    posted_at=datetime.now(timezone.utc) if result.get('success') else None
                )
            else:
                post = Post(
                    product_id=product.id,
                    product_title=product.title,
                    product_image=product.image_url,
                    caption=caption,
                    hashtags=hashtags,
                    platform="instagram",
                    status="pending",
                    scheduled_at=datetime.now(timezone.utc)
                )
            
            post_dict = post.model_dump()
            post_dict['scheduled_at'] = post_dict['scheduled_at'].isoformat()
            if post_dict.get('posted_at'):
                post_dict['posted_at'] = post_dict['posted_at'].isoformat()
            post_dict['created_at'] = post_dict['created_at'].isoformat()
            
            await db.posts.insert_one(post_dict)
        
        # Update analytics
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        analytics_doc = await db.analytics.find_one({"date": today}, {"_id": 0})
        
        if analytics_doc:
            await db.analytics.update_one(
                {"date": today},
                {"$inc": {"total_posts": len(selected_products), "instagram_posts": len(selected_products)}}
            )
        else:
            analytics = Analytics(
                date=today,
                total_posts=len(selected_products),
                instagram_posts=len(selected_products)
            )
            analytics_dict = analytics.model_dump()
            analytics_dict['created_at'] = analytics_dict['created_at'].isoformat()
            await db.analytics.insert_one(analytics_dict)
        
        logging.info(f"Successfully processed {len(selected_products)} products")
        
    except Exception as e:
        logging.error(f"Error in process_and_post_products: {str(e)}")

def run_async_job():
    """Wrapper to run async job in sync scheduler"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(process_and_post_products())
    loop.close()

# ============= Routes =============

# Health check route
@api_router.get("/")
async def root():
    return {"message": "AutoAffiliatePublisher API is running", "status": "ok"}

@api_router.post("/auth/register", response_model=Token)
async def register(admin_data: AdminCreate):
    """Register a new admin"""
    # Check if admin already exists
    existing = await db.admins.find_one({"username": admin_data.username}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash password
    password_hash = pwd_context.hash(admin_data.password)
    
    admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=password_hash
    )
    
    admin_dict = admin.model_dump()
    admin_dict['created_at'] = admin_dict['created_at'].isoformat()
    
    await db.admins.insert_one(admin_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": admin.username})
    
    return Token(
        access_token=access_token,
        admin={
            "id": admin.id,
            "username": admin.username,
            "email": admin.email
        }
    )

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: AdminLogin):
    """Login admin"""
    admin_doc = await db.admins.find_one({"username": credentials.username}, {"_id": 0})
    
    if not admin_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(credentials.password, admin_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": admin_doc['username']})
    
    return Token(
        access_token=access_token,
        admin={
            "id": admin_doc['id'],
            "username": admin_doc['username'],
            "email": admin_doc['email']
        }
    )

@api_router.get("/auth/verify")
async def verify_token(username: str = Depends(get_current_admin)):
    """Verify if token is valid"""
    admin_doc = await db.admins.find_one({"username": username}, {"_id": 0})
    if not admin_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return {
        "id": admin_doc['id'],
        "username": admin_doc['username'],
        "email": admin_doc['email']
    }

@api_router.get("/integrations", response_model=IntegrationConfig)
async def get_integrations(username: str = Depends(get_current_admin)):
    """Get integration configurations"""
    config = await db.integration_configs.find_one({}, {"_id": 0})
    
    if not config:
        # Create default config
        default_config = IntegrationConfig()
        config_dict = default_config.model_dump()
        config_dict['updated_at'] = config_dict['updated_at'].isoformat()
        await db.integration_configs.insert_one(config_dict)
        return default_config
    
    if isinstance(config.get('updated_at'), str):
        config['updated_at'] = datetime.fromisoformat(config['updated_at'])
    
    return IntegrationConfig(**config)

@api_router.put("/integrations")
async def update_integrations(config: IntegrationConfig, username: str = Depends(get_current_admin)):
    """Update integration configurations"""
    config.updated_at = datetime.now(timezone.utc)
    config_dict = config.model_dump()
    config_dict['updated_at'] = config_dict['updated_at'].isoformat()
    
    await db.integration_configs.update_one(
        {},
        {"$set": config_dict},
        upsert=True
    )
    
    return {"message": "Integration config updated successfully"}

@api_router.get("/scheduler", response_model=SchedulerConfig)
async def get_scheduler(username: str = Depends(get_current_admin)):
    """Get scheduler configuration"""
    config = await db.scheduler_configs.find_one({}, {"_id": 0})
    
    if not config:
        default_config = SchedulerConfig()
        config_dict = default_config.model_dump()
        config_dict['updated_at'] = config_dict['updated_at'].isoformat()
        await db.scheduler_configs.insert_one(config_dict)
        return default_config
    
    if isinstance(config.get('updated_at'), str):
        config['updated_at'] = datetime.fromisoformat(config['updated_at'])
    
    return SchedulerConfig(**config)

@api_router.put("/scheduler")
async def update_scheduler(config: SchedulerConfig, username: str = Depends(get_current_admin)):
    """Update scheduler configuration"""
    config.updated_at = datetime.now(timezone.utc)
    config_dict = config.model_dump()
    config_dict['updated_at'] = config_dict['updated_at'].isoformat()
    
    await db.scheduler_configs.update_one(
        {},
        {"$set": config_dict},
        upsert=True
    )
    
    # Restart scheduler if active
    if config.is_active:
        if scheduler.running:
            scheduler.remove_all_jobs()
        else:
            scheduler.start()
        
        # Schedule job every 4 hours
        scheduler.add_job(
            run_async_job,
            'interval',
            hours=4,
            id='product_posting_job',
            replace_existing=True
        )
        logging.info("Scheduler activated")
    else:
        if scheduler.running:
            scheduler.remove_all_jobs()
        logging.info("Scheduler deactivated")
    
    return {"message": "Scheduler config updated successfully"}

@api_router.post("/scheduler/run-now")
async def run_scheduler_now(username: str = Depends(get_current_admin)):
    """Manually trigger the product fetching and posting job"""
    executor.submit(run_async_job)
    return {"message": "Job started successfully"}

@api_router.get("/products")
async def get_products(limit: int = 50, username: str = Depends(get_current_admin)):
    """Get all products"""
    products = await db.products.find({}, {"_id": 0}).sort("fetched_at", -1).limit(limit).to_list(limit)
    
    for product in products:
        if isinstance(product.get('fetched_at'), str):
            product['fetched_at'] = datetime.fromisoformat(product['fetched_at'])
    
    return products

@api_router.get("/posts")
async def get_posts(limit: int = 100, username: str = Depends(get_current_admin)):
    """Get all posts"""
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for post in posts:
        if isinstance(post.get('scheduled_at'), str):
            post['scheduled_at'] = datetime.fromisoformat(post['scheduled_at'])
        if post.get('posted_at') and isinstance(post.get('posted_at'), str):
            post['posted_at'] = datetime.fromisoformat(post['posted_at'])
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    
    return posts

@api_router.get("/analytics/overview")
async def get_analytics_overview(username: str = Depends(get_current_admin)):
    """Get analytics overview"""
    # Get today's stats
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_analytics = await db.analytics.find_one({"date": today}, {"_id": 0})
    
    # Get total posts
    total_posts = await db.posts.count_documents({})
    successful_posts = await db.posts.count_documents({"status": "posted"})
    failed_posts = await db.posts.count_documents({"status": "failed"})
    pending_posts = await db.posts.count_documents({"status": "pending"})
    
    # Get posts by platform
    instagram_posts = await db.posts.count_documents({"platform": "instagram"})
    facebook_posts = await db.posts.count_documents({"platform": "facebook"})
    pinterest_posts = await db.posts.count_documents({"platform": "pinterest"})
    
    # Get total products
    total_products = await db.products.count_documents({})
    
    return {
        "today": today_analytics or {},
        "total_posts": total_posts,
        "successful_posts": successful_posts,
        "failed_posts": failed_posts,
        "pending_posts": pending_posts,
        "instagram_posts": instagram_posts,
        "facebook_posts": facebook_posts,
        "pinterest_posts": pinterest_posts,
        "total_products": total_products
    }

@api_router.get("/analytics/chart")
async def get_analytics_chart(days: int = 7, username: str = Depends(get_current_admin)):
    """Get analytics data for charts"""
    analytics_list = await db.analytics.find({}, {"_id": 0}).sort("date", -1).limit(days).to_list(days)
    
    for item in analytics_list:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    
    return sorted(analytics_list, key=lambda x: x['date'])

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting AutoAffiliatePublisher backend...")
    # Start scheduler
    scheduler_config = await db.scheduler_configs.find_one({}, {"_id": 0})
    if scheduler_config and scheduler_config.get('is_active'):
        scheduler.start()
        scheduler.add_job(
            run_async_job,
            'interval',
            hours=4,
            id='product_posting_job',
            replace_existing=True
        )
        logger.info("Scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    client.close()
    if scheduler.running:
        scheduler.shutdown()
    executor.shutdown(wait=False)
    logger.info("Shutdown complete")