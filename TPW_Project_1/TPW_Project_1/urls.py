from django.contrib import admin
from django.urls import path
from AmorCamisola import views
from django.contrib.auth import views as auth_views
from django.conf.urls.static import static
from django.conf import settings
from AmorCamisola.views import CustomLoginView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('createaccount/', views.createAccount, name='createaccount'),
    path('myprofile/', views.myProfile, name='myprofile'),

    path('profile/<str:username>', views.viewProfile, name='profile'),
    path('publishproduct/', views.pubProduct, name='publishproduct'),
    path('detailedproduct/<int:id>/', views.detailedProduct, name='detailedproduct'),
    path('login/', CustomLoginView.as_view(next_page="home"), name='login'),
    path('logout', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('',views.home, name='home'),
    path('follow/<str:username>/', views.follow_user, name='follow'),
    path('unfollow/<str:username>/', views.unfollow_user, name='unfollow'),

    path('acceptOffer/<int:id>/', views.acceptOffer, name='acceptOffer'),

    path('counterOffer/<int:id>/', views.counterOffer, name='counterOffer'),

    path('retractOffer/<int:id>/', views.retractOffer, name='retractOffer'),

    path('rejectOffer/<int:id>/', views.rejectOffer, name='rejectOffer'),
    path('confirm_payment/<int:id>/', views.confirmPayment, name='confirmPayment'),
    path('confirm_received/<int:id>/', views.confirmDelivery, name='confirmDelivery'),
    path('offers/', views.offers, name='offers'),
    path('userlist/', views.userlist, name='userlist'),
    path('wallet/', views.walletLogic, name='wallet'),
    path('wallet/deposit/', views.deposit_money, name='deposit_money'),
    path('wallet/withdraw/', views.withdraw_money, name='withdraw_money'),
    path('myprofile/settings', views.accountSettings, name='profile_settings'),  # Profile page
    path('favorites/', views.favorite_list, name='favorite_list'),

    path('moderator/dashboard/', views.moderator_dashboard, name='moderator_dashboard'),
    path('moderator/ban_user/<int:user_id>/', views.ban_user, name='ban_user'),
    path('moderator/unban_user/<int:user_id>/', views.unban_user, name='unban_user'),
    path('close_report/<int:report_id>/', views.close_report, name='close_report'),
    path('moderator/delete_product/<int:product_id>/', views.delete_product, name='delete_product'),

    path('moderator/delete_product_user/<int:product_id>/', views.delete_product_user, name='delete_product_user'),
    path('productviewbymoderator/<int:product_id>/', views.product_mod_view, name='product_mod_view'),
    path('userviewbymoderator/<str:username>/', views.user_mod_view, name='user_mod_view'),


    # ------ REST API ------ #

    path('ws/login', views.login, name='login'),
    path('ws/register', views.register, name='register'),
    path('ws/products/', views.products, name='get_products'), #can be get and post
    path('ws/products/<int:id>/', views.get_product_by_id, name='get_product_by_id'), # can get, put and delete
    path('ws/users/', views.get_users, name='get_users'), #optional id argument
    path('ws/usersprofiles/', views.get_user_profiles, name='get_user_profiles'),
    path('ws/offers/', views.get_user_offers, name='get_user_offers'),
    path('ws/follows/', views.follows, name='follows'),
    path('ws/offers/<int:id>/', views.get_offer_by_id, name='get_offer_by_id'),
    path('ws/users/<int:user_id>/favorites/', views.user_favorites, name='user_favorites'),  
    path('ws/users/<int:user_id>/favorites/<int:product_id>/', views.user_favorites, name='user_favorites_product'),  
    #path('ws/reports/', views.api_reports, name='api_reports'),
    #path('ws/reports/<int:id>/', views.api_report, name='api_report'),
    

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)