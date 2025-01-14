import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-3^o=3lthe4sfo6t96kg6x113!v8hke42#3hidp%#mx_-v6#d-r'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

from .custom_types import Minio_Secrets, Neo4J_Secrets
if DEBUG:

    from .dev_env import *

    MINIO_CONFIG: Minio_Secrets = {
        "endpoint": MINIO_ENDPOINT_DEV,
        "access_key": MINIO_ACCESS_KEY_DEV,
        "secret_key": MINIO_SECRET_KEY_DEV
    }

    NEO4J_CONFIG: Neo4J_Secrets = {
        "api_url": NEO4J_API_URL_DEV,
        "endpoint": NEO4J_ENDPOINT_DEV,
        "username": NEO4J_USERNAME_DEV,
        "password": NEO4J_PASSWORD_DEV
    }

else:
    MINIO_CONFIG: Minio_Secrets = {
        "endpoint": os.environ.get("MINIO_ENDPOINT_PROD"),
        "access_key": os.environ.get("MINIO_ACCESS_KEY_PROD"),
        "secret_key": os.environ.get("MINIO_SECRET_KEY_PROD")
    }
    
    NEO4J_CONFIG: Neo4J_Secrets = {
        "api_url": os.environ.get("NEO4J_API_URL_PROD"),
        "endpoint": os.environ.get("NEO4J_ENDPOINT_PROD"),
        "username": os.environ.get("NEO4J_USERNAME_PROD"),
        "password": os.environ.get("NEO4J_PASSWORD_PROD")
    }

# App specific configs:
NEWS_ARTICLES_LAYERS = {
    "tt_roads": {
        "bucket": "trinidad-tobago", 
        "prefix": "layers/tt_roads.parquet",
        "main_association_col": "name",
        "cols_to_include": ['name', 'geometry']
    },
    "tt_regions": {
        "bucket": "trinidad-tobago", 
        "prefix":"layers/tt_admin_regions.parquet",
        "main_association_col": "NAME_1",
        "cols_to_include": ["NAME_1", 'geometry']
    }
}

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'template_partials',

    'upload_static_files',
    'news_articles'

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'spatial_labeling_dashboard.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.joinpath('templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'spatial_labeling_dashboard.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / "static",
]
# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
