from AmorCamisola.forms import *
from AmorCamisola.models import *

from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from AmorCamisola.serializers import *
from decimal import Decimal


def retractOffer(request, id):
    offer = Offer.objects.get(id=id)
    if offer.payment_method == "store_credit" and not offer.product.sold:
        if offer.sent_by.id == offer.buyer.id:
            offer.buyer.wallet += offer.value
        offer.buyer.save()
    offer.delete()

def confirmPayment(request, id):
    offer = Offer.objects.get(id=id)
    offer.paid = not offer.paid
    offer.save()
    if offer.paid and offer.delivered:
        newOffer = Offer(buyer=offer.buyer, product=offer.product, value=offer.value,
                         payment_method=offer.payment_method, delivery_method=offer.delivery_method,
                         address=offer.address, sent_by=offer.buyer, offer_status=offer.offer_status,
                         delivered=offer.delivered, paid=offer.paid)
        if offer.buyer == offer.sent_by:
            userProfile = UserProfile.objects.get(user__id=offer.product.seller.id)
            newOffer = Offer(buyer=offer.buyer, product=offer.product, value=offer.value, payment_method=offer.payment_method, delivery_method=offer.delivery_method, address=offer.address, sent_by=userProfile, offer_status=offer.offer_status, delivered=offer.delivered, paid=offer.paid)
        newOffer.save()

def confirmDelivery(request, id):
    offer = Offer.objects.get(id=id)
    offer.delivered = not offer.delivered
    if offer.paid and offer.delivered:
        newOffer = Offer(buyer=offer.buyer, product=offer.product, value=offer.value,
                         payment_method=offer.payment_method, delivery_method=offer.delivery_method,
                         address=offer.address, sent_by=offer.buyer, offer_status=offer.offer_status,
                         delivered=offer.delivered, paid=offer.paid)
        if offer.buyer == offer.sent_by:
            userProfile = UserProfile.objects.get(user__id=offer.product.seller.id)
            newOffer = Offer(buyer=offer.buyer, product=offer.product, value=offer.value, payment_method=offer.payment_method, delivery_method=offer.delivery_method, address=offer.address, sent_by=userProfile, offer_status=offer.offer_status, delivered=offer.delivered, paid=offer.paid)
        newOffer.save()
    offer.save()


def valid_purchase(user : UserProfile, offer : Offer):
    return user.wallet < offer.value and not offer.product.sold

def perform_sale(buyer : UserProfile, seller : UserProfile, offer : Offer):
    if valid_purchase(buyer, offer):
        buyer.wallet -= offer.product.price
        seller.wallet += offer.product.price
        buyer.save()
        seller.save()
        return True
    return False


def getOffersCount(request):
    if request.user.is_authenticated:
        receivedOffers = Offer.objects.filter(product__seller_id=request.user.id) | Offer.objects.filter(buyer__user_id=request.user.id)
        receivedOffersFiltered = receivedOffers.exclude(sent_by__user_id=request.user.id).filter(offer_status__exact='in_progress')
        return receivedOffersFiltered.count()
    return 0

def notifySuccess(offer_id):
    offer = Offer.objects.get(id=offer_id)
    otherOffers = Offer.objects.filter(product_id=offer.product.id).exclude(id=offer.id)
    if (offer.payment_method == "store_credit" and offer.buyer.user.id != offer.sent_by.user.id):
        offer.buyer.wallet -= offer.value
    for otherOffer in otherOffers:
        otherOffer.offer_status = 'rejected'
        if (otherOffer.payment_method == "store_credit"):
            otherOffer.buyer.wallet += offer.value
            otherOffer.buyer.save()
        otherOffer.save()

    if offer.payment_method == "store_credit":
        seller = UserProfile.objects.get(user__id=offer.product.seller.id)
        seller.wallet += offer.value
        seller.save()

    offer.product.sold = True
    offer.product.save()
    offer.offer_status = 'accepted'
    offer.save()

def notifyFailed(offer_id):
    offer = Offer.objects.get(id=offer_id)
    if offer.payment_method == "store_credit" and offer.buyer.user.id == offer.sent_by.user.id:
        offer.buyer.wallet += offer.value
        offer.buyer.save()
    newOffer = Offer(buyer=offer.buyer, product=offer.product, value=offer.value,
                     payment_method=offer.payment_method, delivery_method=offer.delivery_method,
                     address=offer.address, sent_by=offer.buyer, offer_status=offer.offer_status,
                     delivered=offer.delivered, paid=offer.paid)
    if offer.buyer == offer.sent_by:
        seller = UserProfile.objects.get(user__id=offer.product.seller.id)
        newOffer = Offer(buyer=offer.buyer, product=offer.product, value=offer.value, payment_method=offer.payment_method, delivery_method=offer.delivery_method, address=offer.address, sent_by=seller, offer_status=offer.offer_status, delivered=offer.delivered, paid=offer.paid)
    newOffer.save()
    offer.offer_status = 'rejected'
    offer.save()


@api_view(['GET'])
def get_users(request):
    username=None
    if 'username' in request.GET:
        username = request.GET['username']
    if username:
        try:
            user = UserProfile.objects.get(user__username=username)
        except UserProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileSerializer(user, many=False)
        return Response(serializer.data)
    users = UserProfile.objects.all()
    num = 10
    if 'num' in request.GET:
        num = int(request.GET['num'])
    if 'page' in request.GET:
        page = int(request.GET['page'])
        users = users[(page-1)*num:min(len(users), page*num)]
    serializer = UserProfileSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT'])
def userProfile_by_id(request, id):
    if request.method == 'GET':
        try:
            user = UserProfile.objects.get(id=id)
        except UserProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = UserProfileSerializer(user, many=False)
        return Response(serializer.data)
    elif request.method == 'PUT':
        try:
            password = request.data.get('password')
            image_base64 = request.data.get('image_base64')  
            userProfile = UserProfile.objects.get(user_id=id)
        except UserProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserProfileSerializer(userProfile, data=request.data)
        serializer.is_valid()
        serializer.update(instance=userProfile, validated_data=request.data, password=password, image_base64=image_base64)
        return Response(serializer.data)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

def get_offers_aux(request):
    userProfile = UserProfile.objects.get(user__id=request.user.id)
    user = User.objects.get(id=request.user.id)
    madeOffers = Offer.objects.filter(sent_by__user_id=request.user.id).filter(offer_status__exact='in_progress')
    receivedOffers = Offer.objects.filter(product__seller_id=request.user.id) | Offer.objects.filter(buyer__user_id=request.user.id)
    receivedOffersFiltered = receivedOffers.exclude(sent_by__user_id=request.user.id).filter(offer_status__exact='in_progress')
    acceptedOffers = receivedOffers.filter(offer_status__exact='accepted').exclude(paid=True, delivered=True) | madeOffers.filter(offer_status__exact='accepted').exclude(paid=True, delivered=True)
    processedOffers = receivedOffers.filter(offer_status__exact='rejected') | madeOffers.filter(offer_status__exact='rejected') | Offer.objects.filter(paid=True, delivered=True, sent_by__user_id=request.user.id)
    user_profile_serializer = UserProfileSerializer(userProfile, many=False)
    user_serializer = UserSerializer(user, many=False)
    madeOffers_serializer = OfferSerializer(madeOffers, many=True)
    receivedOffersFiltered_serializer = OfferSerializer(receivedOffersFiltered, many=True)
    acceptedOffers_serializer = OfferSerializer(acceptedOffers, many=True)
    processedOffers_serializer = OfferSerializer(processedOffers, many=True)
    return Response({
        'profile': user_profile_serializer.data,
        'user': user_serializer.data,
        'offers_received': receivedOffersFiltered_serializer.data,
        'offers_made': madeOffers_serializer.data,
        'offers_accepted': acceptedOffers_serializer.data,
        'offers_processed': processedOffers_serializer.data
    })

def create_offer(request):
    offer_serializer = OfferSerializer(data=request.data)
    offer_serializer.is_valid()
    offer = offer_serializer.create(validated_data=request.data)
    offer.buyer.wallet -= Decimal(offer.value)
    offer.buyer.save()    
    return get_offers_aux(request)


@api_view(['GET', 'POST', 'PUT'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_offers(request):
    if request.method == 'GET':
        return get_offers_aux(request)
    if request.method == 'PUT':
        return handle_offers(request)
    if request.method == 'POST':
        return create_offer(request)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_offer_by_id(request):
    id = request.GET['id']
    try:
        offer = Offer.objects.get(id=id)
        if offer.product.seller.id != request.user.id or offer.buyer.user.id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
    except Offer.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = OfferSerializer(offer, many=False)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
def get_product_by_id(request, id):
    if request.method == 'PUT':
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.update(instance=product, validated_data=request.data)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'GET':
        try:
            product = Product.objects.get(id=id)
        except Product.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, many=False)
        return Response(serializer.data)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET', 'POST'])
def products(request):
    if request.method == 'POST':
        product=request.data
        serializer = ProductSerializer(data=product)
        serializer.is_valid()
        product = serializer.create(validated_data=product)
        return Response(product.data)
    elif request.method == 'GET':
        username=None
        if 'username' in request.GET:
            username = request.GET["username"]
            products = Product.objects.filter(seller__username=username)
        elif 'user_id' in request.GET:
            user_id = request.GET['user_id']
            products = Product.objects.filter(seller__id=user_id)
        else:
            products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    else:
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
def get_products_by_user(request, user_id):
    if request.method == 'GET':
        try:
            user = UserProfile.objects.get(user__id=user_id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        products = Product.objects.filter(seller=user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_favorites(request, user_id, product_id=None):
    if request.method == 'GET':
        try:
            favorite = Favorite.objects.get(user_id=user_id)
        except Favorite.DoesNotExist:
            return Response(
                {"detail": "Favorites not found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        products = favorite.products.all()
        serializer = ProductSerializer(products, many=True)        
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        if product_id is None:
            return Response(
                {"detail": "Product ID is required to add to favorites."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            favorite = Favorite.objects.get(user_id=user_id)
            product = Product.objects.get(id=product_id)
            favorite.products.add(product)
            favorite.save()
            return Response(
                {"detail": "Product added to favorites."}, 
                status=status.HTTP_200_OK
            )
        except Favorite.DoesNotExist:
            return Response(
                {"detail": "Favorites not found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
    elif request.method == 'DELETE':
        if product_id is None:
            return Response(
                {"detail": "Product ID is required to remove from favorites."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            favorite = Favorite.objects.get(user_id=user_id)
            product = Product.objects.get(id=product_id)
            favorite.products.remove(product)
            favorite.save()
            return Response(
                {"detail": "Product removed from favorites."}, 
                status=status.HTTP_200_OK
            )
        except Favorite.DoesNotExist:
            return Response(
                {"detail": "Favorites not found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response(
            {"detail": "Method not allowed."}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


@api_view(['GET', 'POST', 'DELETE'])
def follows(request):
    if request.method == 'GET':
        if 'userId' in request.GET:
            userId = request.GET["userId"]
        try:
            following = Following.objects.filter(following__id=userId)
        except Following.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        following_serializer = FollowingSerializer(following, many=True)
        followed_users = []
        for entry in following_serializer.data:
            try:
                followed_user = User.objects.get(id=entry['followed'])
                followed_user_serializer = UserSerializer(followed_user)
                followed_users.append(followed_user_serializer.data)
            except User.DoesNotExist:
                continue
        return Response(followed_users)
    elif request.method == 'POST':
        serialize = FollowingSerializer(data=request.data)
        if serialize.is_valid():
            serialize.save()
            return Response(serialize.data, status=status.HTTP_201_CREATED)
        
        return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        serialize = FollowingSerializer(data=request.data)
        
        if serialize.is_valid():
            following_data = serialize.validated_data
            following_user = following_data.get('following')
            followed_user = following_data.get('followed')

            following_relations = Following.objects.filter(following=following_user, followed=followed_user)

            if following_relations.exists():
                
                deleted_count, _ = following_relations.delete()
                if deleted_count > 0:
                    
                    return Response(request.data)
                else:
                    
                    return Response({'error': 'No matching following relationship found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                
                return Response({'error': 'Following relationship not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def followers(request, id):
    if request.method == 'GET':
        try:
            
            followers = Following.objects.filter(followed__id=id)
        except Following.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        followers_serializer = FollowingSerializer(followers, many=True)
        following_users = []
        for entry in followers_serializer.data:
            try:
                following_user = User.objects.get(id=entry['following'])
                following_user_serializer = UserSerializer(following_user)
                following_users.append(following_user_serializer.data)
            except User.DoesNotExist:
                continue
        
        return Response(following_users)

    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET'])
def get_user_profiles(request):
    try:
        usernames = request.GET.get('usernames')
        if not usernames:
            return Response(
                {"error": "No 'usernames' parameter provided in the query string."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usernames_list = usernames.split(',')

        user_profiles = UserProfile.objects.filter(user__username__in=usernames_list)

        serializer = UserProfileSerializer(user_profiles, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def login(request):
    if request.method == 'POST':
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            try_user = User.objects.get(username=username)
            if username == "admin" and password == "admin":
                return Response({"admin": True},status=status.HTTP_401_UNAUTHORIZED)
            banned = not try_user.is_active
            user = authenticate(username=username, password=password)
            if user is not None:
                user_profile = UserProfile.objects.get(user=user)
                user_serializer = UserProfileSerializer(user_profile, many=False)
                token, _ = Token.objects.get_or_create(user=user)
                return Response({"userProfile": user_serializer.data, "token": token.key, "banned": banned}, status=status.HTTP_200_OK)
            else:
                return Response({"banned": banned},status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        password = request.data.get('password')
        user_profile_data = request.data.get('userProfile')
        profile_serializer = UserProfileSerializer(data=user_profile_data)
        user_profile = profile_serializer.create(validated_data=user_profile_data, password=password)
        if not user_profile:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        new_profile_serializer = UserProfileSerializer(user_profile, many=False)
        token, _ = Token.objects.get_or_create(user=user_profile.user)
        return Response({"userProfile": new_profile_serializer.data, "token": token.key}, status=status.HTTP_201_CREATED)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET'])
def moderator(request):
    username=None
    if 'username' in request.GET:
        
        username = request.GET['username']
    if username:
        user = User.objects.get(username=username)
        
        
        return Response(user.groups.filter(name='Moderators').exists(),status=status.HTTP_200_OK)
    else:
        return Response(False,status=status.HTTP_200_OK)


def handle_offers(request):
    if request.method == 'PUT':
        action = request.data.get('action')
        offer = request.data.get('offer')
        offer_serializer = OfferSerializer(data=offer)
        offer_serializer.is_valid()
        offer_id = offer.get('id')
        if action == 'accepted':
            notifySuccess(offer_id)
        elif action == 'rejected':
            notifyFailed(offer_id)
        elif action == 'countered':
            if 'payment_method' in offer and 'delivery_method' in offer and 'address' in offer and 'value' in offer:
                payment_method = offer.get('payment_method')
                delivery_method = offer.get('delivery_method')
                address = offer.get('address')
                value = offer.get('value')
                
                new_offer = Offer.objects.get(id=offer_id)
                if payment_method == "store_credit":
                    if new_offer.buyer.id == new_offer.sent_by.id:
                        new_offer.buyer.wallet -= new_offer.value
                    else:
                        new_offer.buyer.wallet += new_offer.value
                    new_offer.buyer.save()
                new_offer.payment_method = payment_method
                new_offer.delivery_method = delivery_method
                new_offer.address = address
                new_offer.value = value
                new_offer.sent_by = UserProfile.objects.get(user__id=request.user.id)
                new_offer.save()
        elif action == 'delivered':
            confirmDelivery(request, offer_id)
        elif action == 'paid':
            confirmPayment(request, offer_id)
        elif action == 'deleted':
            retractOffer(request, offer_id)
        else:
            
            return Response(status=status.HTTP_400_BAD_REQUEST)
        return get_offers_aux(request)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_products_reports(request):
    pid=None
    if 'pid' in request.GET:
        pid = request.GET['pid']
        if pid:
            product = Product.objects.get(id=pid)
            reports = Report.objects.filter(product=product)
            serialized_report = ReportSerializer(reports,many=True)
            return Response(serialized_report.data,status=status.HTTP_200_OK)
    else:
        all_reports = Report.objects.all()

        
        seen_products = {}
        for report in all_reports.filter(product__isnull=False):
            product_id = report.product.id
            if product_id not in seen_products:
                new_report = ReportSerializer(report,many=False)
                seen_products[product_id] = {'report': new_report.data, 'count': 1}
            else:
                seen_products[product_id]['count'] += 1
        product_reports = list(seen_products.values())
        
        return Response(product_reports,status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_reports(request):
    username=None
    if 'username' in request.GET:
        username = request.GET['username']
        if username:
            user = UserProfile.objects.get(user__username=username)
            reports = Report.objects.filter(reporting=user)
            serialized_report = ReportSerializer(reports,many=True)
            return Response(serialized_report.data,status=status.HTTP_200_OK)
    else:
        all_reports = Report.objects.all()
        seen_users = {}
        for report in all_reports.filter(reporting__isnull=False):
            reporting_id = report.reporting.id
            if reporting_id not in seen_users:
                new_report = ReportSerializer(report, many=False)
                seen_users[reporting_id] = {'report': new_report.data, 'count': 1}
            else:
                seen_users[reporting_id]['count'] += 1

        user_reports = list(seen_users.values())
        
        return Response(user_reports,status=status.HTTP_200_OK)
    
def deposit_money_api(id, deposit_amount):
    userinfo = UserProfile.objects.get(user__id=id)
    userinfo.wallet += deposit_amount
    userinfo.save()
    return Response({'wallet': userinfo.wallet}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_product_a(request, product_id):
    if request.method == 'DELETE':
        try:
            
            product = get_object_or_404(Product, id=product_id)

            
            product.delete()

            
            return Response({'message': f'Product with ID {product_id} deleted successfully.'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    return Response({'error': 'Invalid request method.'}, status=400)


@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def toggle_ban_user(request, user_id):
    """Ban or unban a user based on their current active status."""
    user = get_object_or_404(User, id=user_id)
    if user.is_active:
        user.is_active = False
        action = "banned"
        user_products = Product.objects.filter(seller = user)
        for x in user_products:
            x.is_active = False
            x.save()
        related_offers = Offer.objects.filter(
            models.Q(buyer=user.userprofile) | models.Q(product__seller=user)
        )
        for offer in related_offers:
            
            offer_status_conditions = offer.paid and not offer.delivered

            offer_status_conditions2 = offer.offer_status in ["accepted","rejected"] and not offer.paid and not offer.delivered

            offer_status_conditions3 = offer.offer_status in ["in_progress"]

            

            buyer_profile = offer.buyer
            seller_profile = UserProfile.objects.get(user=offer.product.seller)

            if (offer.product.seller == user and (offer_status_conditions or offer_status_conditions2)) or \
                    (offer.buyer == user and (offer_status_conditions or offer_status_conditions2)):
                

                buyer_profile.wallet += offer.value
                buyer_profile.save()
                seller_profile.wallet -= offer.value
                seller_profile.save()

                offer.delete()

            elif offer_status_conditions3:
                

                buyer_profile.wallet += offer.value
                buyer_profile.save()

                offer.delete()
    else:
        user.is_active = True
        action = "unbanned"
        user_products = Product.objects.filter(seller = user)
        for x in user_products:
            x.is_active = True
            x.save()
    user.save()
    return Response({"message": f"User {action} successfully.", "is_active": user.is_active})

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def close_report_a(request, report_id):
    """Close (delete) a report."""
    report = get_object_or_404(Report, id=report_id)
    if report.product:
        Report.objects.filter(product=report.product).delete()
    if report.reporting:
        Report.objects.filter(reporting=report.reporting).delete()

    return Response({"message": "Report closed successfully."})

@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_report(request):
    
    """API endpoint to create a new report."""
    report_serializer = ReportSerializer(data=request.data)
    
    report = report_serializer.create(validated_data=request.data)
    
    new_report = ReportSerializer(report,many=False)
    if (new_report.is_valid):
        return Response(new_report.data, status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)


def withdraw_money_api(user_id, withdrawal_amount):
    userinfo = UserProfile.objects.get(user__id=user_id)
    if withdrawal_amount <= userinfo.wallet:
        userinfo.wallet -= withdrawal_amount
        userinfo.save()
    return Response({'wallet': userinfo.wallet}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def wallet_function(request):
    try:
        userProfile = UserProfile.objects.get(user=request.user)
        if request.method == 'GET':
            return Response({'wallet': userProfile.wallet}, status=status.HTTP_200_OK)
        elif request.method == 'PUT':
            amount = request.data.get('amount')
            action = request.data.get('action')
            if action == 'deposit':
                return deposit_money_api(userProfile.user.id, amount)
            elif action == 'withdraw':
                return withdraw_money_api(userProfile.user.id, amount)
        else:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
    except UserProfile.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_product(request, product_id):
    try:
        if product.seller.id == request.user.id:
            product = Product.objects.get(id=product_id)
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_403_FORBIDDEN)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def check_notifs(request):
    return Response({'offer_count': getOffersCount(request)}, status=status.HTTP_200_OK)

