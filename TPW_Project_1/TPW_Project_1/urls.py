from django.contrib import admin
from django.urls import path
from AmorCamisola import views
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ws/login', views.login, name='login'),
    path('ws/register', views.register, name='register'),
    path('ws/moderator', views.moderator, name='moderator'),
    path('ws/products/', views.products, name='get_products'), 
    path('ws/products/<int:id>/', views.get_product_by_id, name='get_product_by_id'), 
    path('ws/users/', views.get_users, name='get_users'), 
    path('ws/usersprofiles/', views.get_user_profiles, name='get_user_profiles'),
    path('ws/offers/', views.get_user_offers, name='get_user_offers'),
    path('ws/follows/', views.follows, name='follows'),
    path('ws/followers/<int:id>/', views.followers, name='followers'),
    path('ws/offers/<int:id>/', views.get_offer_by_id, name='get_offer_by_id'),
    path('ws/users/<int:user_id>/favorites/', views.user_favorites, name='user_favorites'),  
    path('ws/users/<int:user_id>/favorites/<int:product_id>/', views.user_favorites, name='user_favorites_product'), 
    path('ws/product-reports/', views.get_products_reports , name='get_products_reports'),
    path('ws/user-reports/', views.get_user_reports , name='get_user_reports'),   
    path('ws/users/<int:id>', views.userProfile_by_id , name='userProfile_by_id'),
    path('ws/users/wallet/', views.wallet_function, name='wallet'),
    path('ws/users/notifs/', views.check_notifs, name='check_notifs'),
    path('ws/products/<int:product_id>/delete', views.delete_product_a, name='delete_product_a'),
    path('ws/users/<int:user_id>/toggle-ban/', views.toggle_ban_user, name='toggle_ban_user'),
    path('ws/reports/<int:report_id>/close/', views.close_report_a, name='close_report_a'),
    path('ws/reports/', views.create_report, name='create_report'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)