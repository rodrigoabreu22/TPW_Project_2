import json
from AmorCamisola.forms import *
from AmorCamisola.models import *
from django.contrib.auth.models import Group

from django.contrib.auth import authenticate, login as auth_login
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from django.db.models import Count, Case, When

from django.contrib import messages

from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render

from django.contrib.auth import views as auth_views
from django.urls import reverse

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from AmorCamisola.serializers import *
from decimal import Decimal


def verifyIfAdmin(request):
    if request.user.is_authenticated and request.user.is_superuser:
        return True
    return False

# Define the test function for checking if the user is a moderator
def is_moderator(user):
    return user.groups.filter(name='Moderators').exists()

# Custom decorator for requiring moderator status
def moderator_required(view_func):
    @login_required(login_url='/login/')
    @user_passes_test(is_moderator, login_url='/login/')
    def wrapped_view(request, *args, **kwargs):
        return view_func(request, *args, **kwargs)
    return wrapped_view

# Example moderator dashboard view
@moderator_required
def moderator_dashboard(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    all_reports = Report.objects.all()

    # Track counts of reports for each user
    seen_users = {}
    for report in all_reports.filter(reporting__isnull=False):
        reporting_id = report.reporting.id
        if reporting_id not in seen_users:
            seen_users[reporting_id] = {'report': report, 'count': 1}
        else:
            seen_users[reporting_id]['count'] += 1

    # Track counts of reports for each product
    seen_products = {}
    for report in all_reports.filter(product__isnull=False):
        product_id = report.product.id
        if product_id not in seen_products:
            seen_products[product_id] = {'report': report, 'count': 1}
        else:
            seen_products[product_id]['count'] += 1

    user_reports = list(seen_users.values())
    product_reports = list(seen_products.values())

    logged = UserProfile.objects.get(user=request.user)

    context = {
        'user_reports': user_reports,
        'product_reports': product_reports,
        'offer_count': getOffersCount(request),
        'profile': logged
    }

    print(user_reports)

    return render(request, 'moderator_dashboard.html', context)

@moderator_required
def user_mod_view(request,username):
    if verifyIfAdmin(request):
        return redirect("/admin")
    profile_user = User.objects.get(username=username)
    print("profile user: ", profile_user)

    following = Following.objects.filter(following_id=profile_user.id)
    followers = Following.objects.filter(followed_id=profile_user.id)
    print(followers)
    selling = Product.objects.filter(seller_id=profile_user.id)

    reports = Report.objects.filter(reporting=profile_user)

    logged= UserProfile.objects.get(user=request.user)

    tparams = {"profile_user": profile_user, "following": following, "followers": followers, "products": selling,
               "offer_count": getOffersCount(request), "reports": reports,
        'profile': logged}

    return render(request, 'profile_moderatorview.html', tparams)



@moderator_required
def product_mod_view(request, product_id):
    if verifyIfAdmin(request):
        return redirect("/admin")
    product = Product.objects.get(id=product_id)
    if Jersey.objects.filter(product=product).exists():
        category = "camisola"
        p = Jersey.objects.get(product=product)
    elif Shorts.objects.filter(product=product).exists():
        category = "calções"
        p = Shorts.objects.get(product=product)
    elif Socks.objects.filter(product=product).exists():
        category = "meias"
        p = Socks.objects.get(product=product)
    elif Boots.objects.filter(product=product).exists():
        category = "chuteiras"
        p = Boots.objects.get(product=product)

    user = User.objects.get(id=request.user.id)
    sellerProfile = UserProfile.objects.get(user=product.seller)
    try:
        userProfile = UserProfile.objects.get(user__id=request.user.id)
    except UserProfile.DoesNotExist:
        userProfile = None

    reports = Report.objects.filter(product=product)

    tparams = {"product": p,"reports":reports, 'profile': userProfile, 'user': user, 'offer_count': getOffersCount(request),
               'sellerProfile': sellerProfile, 'category': category}
    return render(request, 'product_moderatorview.html', tparams)

@moderator_required
def close_report(request, report_id):
    report = get_object_or_404(Report, id=report_id)
    if report:
        report.delete()
        messages.success(request, 'Report has been deleted successfully.')
    else:
        print("Algo de errado não está certo")
    return redirect('moderator_dashboard')


@moderator_required
def ban_user(request, user_id):
    print("Banning")
    user1 = get_object_or_404(UserProfile, id=user_id)
    user = get_object_or_404(User,user1)
    user_products = Product.objects.filter(seller=user)

    user.is_active = False
    user.save()

    for product in user_products:
        product.is_active = False
        product.save()

    related_offers = Offer.objects.filter(
        models.Q(buyer=user.userprofile) | models.Q(product__seller=user)
    )


    for offer in related_offers:
        print(offer)
        offer_status_conditions = offer.paid and not offer.delivered

        offer_status_conditions2 = offer.offer_status in ["accepted","rejected"] and not offer.paid and not offer.delivered

        offer_status_conditions3 = offer.offer_status in ["in_progress"]

        print(offer.product)

        buyer_profile = offer.buyer
        seller_profile = UserProfile.objects.get(user=offer.product.seller)

        if (offer.product.seller == user and (offer_status_conditions or offer_status_conditions2)) or \
                (offer.buyer == user and (offer_status_conditions or offer_status_conditions2)):
            print("Condition 1 or 2 met: Transferring money from seller to buyer and deleting offer")

            buyer_profile.wallet += offer.value
            buyer_profile.save()
            seller_profile.wallet -= offer.value
            seller_profile.save()

            offer.delete()

        elif offer_status_conditions3:
            print("Condition 3 met: Adding money to buyer and deleting offer")

            buyer_profile.wallet += offer.value
            buyer_profile.save()

            offer.delete()

    messages.success(request, f"User {user.username} has been banned and associated data processed.")
    return redirect('moderator_dashboard')


@moderator_required
def unban_user(request, user_id):
    user1 = get_object_or_404(UserProfile, id=user_id)
    user = get_object_or_404(User,user1)
    user_products = Product.objects.filter(seller=user)

    user.is_active = True
    user.save()

    for product in user_products:
        product.is_active = True
        product.save()

    messages.success(request, f"User {user.username} has been unbanned and their products are now accessible.")
    return redirect('moderator_dashboard')

@moderator_required
def delete_product(request, product_id):

    product = get_object_or_404(Product, id=product_id)

    related_offers = Offer.objects.filter(
        models.Q(product=product)
    )

    for offer in related_offers:
        print(offer)
        offer_status_conditions = offer.paid and not offer.delivered

        offer_status_conditions2 = offer.offer_status in ["accepted",
                                                          "rejected"] and not offer.paid and not offer.delivered

        offer_status_conditions3 = offer.offer_status in ["in_progress"]

        print(offer.product)

        if offer_status_conditions or offer_status_conditions2:
            print("Condition 1 or 2 met: Transferring money from seller to buyer and deleting offer")

            buyer = offer.buyer
            buyer.wallet += offer.value
            buyer.save()
            seller = offer.product.seller
            seller.wallet -= offer.value
            seller.save()

            offer.delete()

        elif offer_status_conditions3:
            print("Condition 3 met: Adding money to buyer and deleting offer")

            buyer = offer.buyer
            buyer.wallet += offer.value
            buyer.save()

            offer.delete()
    product.delete()
    messages.success(request, f"Product '{product.name}' has been deleted.")
    return redirect('moderator_dashboard')

def delete_product_user(request, product_id):
    product = get_object_or_404(Product, id=product_id)

    related_offers = Offer.objects.filter(
        models.Q(product=product)
    )

    for offer in related_offers:
        print(offer)
        offer_status_conditions = offer.paid and not offer.delivered

        offer_status_conditions2 = offer.offer_status in ["accepted",
                                                          "rejected"] and not offer.paid and not offer.delivered

        offer_status_conditions3 = offer.offer_status in ["in_progress"]

        print(offer.product)

        if offer_status_conditions or offer_status_conditions2:
            print("Condition 1 or 2 met: Transferring money from seller to buyer and deleting offer")

            buyer = offer.buyer
            buyer.wallet += offer.value
            buyer.save()
            seller = offer.product.seller
            seller.wallet -= offer.value
            seller.save()

            offer.delete()

        elif offer_status_conditions3:
            print("Condition 3 met: Adding money to buyer and deleting offer")

            buyer = offer.buyer
            buyer.wallet += offer.value
            buyer.save()

            offer.delete()

    product.delete()
    messages.success(request, f"Product '{product.name}' has been deleted.")
    return redirect('myprofile')


@login_required
def favorite_list(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    favorite_form = FavoriteForm(request.POST or None)
    user_profile = None
    if request.user.is_authenticated:
        favorite_, _ = Favorite.objects.get_or_create(user=request.user)
        products = favorite_.products.all()
        favorites = favorite_.products.values_list('id', flat=True)
        user_profile = UserProfile.objects.get(user=request.user)

        if favorite_form.is_valid():
            product_id = favorite_form.cleaned_data['favorite_product_id']
            product = get_object_or_404(Product, id=product_id)
            print(f"Product ID: {product.id}")  # Debug
            if product in favorite_.products.all():
                favorite_.products.remove(product)
                print(f"Product {product.id} removed from favorites.")  # Debug
            else:
                favorite_.products.add(product)
                print(f"Product {product.id} added to favorites.")  # Debug
            return redirect('favorite_list')
        else:
            print(f"WOMP WOMP WOMP WOMP WOMP WOMP")
    return render(request, 'favorites.html', {
        'favorite_form': favorite_form,
        'favorites_ids': favorites,
        'products': products,
        'profile': user_profile,
        'offer_count': getOffersCount(request),
    })


class CustomLoginView(auth_views.LoginView):
    template_name = "login.html"

    def form_invalid(self, form):
        username = form.data.get('username')
        try:
            user = User.objects.get(username=username)
            if not user.is_active:
                messages.error(self.request, "This account has been banned.")
                return redirect(reverse('login') + '?banned=true')
        except User.DoesNotExist:
            pass

        return super().form_invalid(form)


SIZE_ORDER = {'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4}

def get_size_order(size):
    return SIZE_ORDER.get(size, -1)

def home(request):
    print("Test")
    if verifyIfAdmin(request):
        return redirect("/admin")
    form = ProductQuery(request.GET or None)
    favorite_form = FavoriteForm(request.POST or None)
    products = Product.objects.all()
    teams=[]
    product_types=[]
    favorites=[]
    user_profile=None
    if form.is_valid():
        name_query = form.cleaned_data['name_query']
        user_query = form.cleaned_data['user_query']
        teams = form.cleaned_data['teams']
        product_types = form.cleaned_data['product_types']
        print("OLA")
        print(product_types)
        min_price = form.cleaned_data['min_price']
        max_price = form.cleaned_data['max_price']
        sort_by = form.cleaned_data['sort_by']

        # Filtering logic
        if name_query:
            products = products.filter(name__icontains=name_query)
        if user_query:
            products = products.filter(seller__username__icontains=user_query)
        if teams:
            products = products.filter(team__in=teams)
        if product_types:
            product_ids = []
            if 'Camisola' in product_types:
                product_ids += Jersey.objects.values_list('product_id', flat=True)
            if 'Calções' in product_types:
                product_ids += Shorts.objects.values_list('product_id', flat=True)
            if 'Meias' in product_types:
                product_ids += Socks.objects.values_list('product_id', flat=True)
            if 'Chuteiras' in product_types:
                product_ids += Boots.objects.values_list('product_id', flat=True)
            products = products.filter(id__in=product_ids)
        if min_price is not None:
            products = products.filter(price__gte=min_price)
        if max_price is not None:
            products = products.filter(price__lte=max_price)

        # Sorting logic
        if sort_by == 'price_asc':
            products = products.order_by('price')
        elif sort_by == 'price_desc':
            products = products.order_by('-price')
        elif sort_by == 'name_asc':
            products = products.order_by('name')
        elif sort_by == 'name_desc':
            products = products.order_by('-name')
        elif sort_by == 'seller_asc':
            products = products.order_by('seller__username')
        elif sort_by == 'seller_desc':
            products = products.order_by('-seller__username')


    if request.user.is_authenticated:
        favorite_, _ = Favorite.objects.get_or_create(user=request.user)
        favorites = favorite_.products.values_list('id', flat=True)

        if favorite_form.is_valid():
            product_id = favorite_form.cleaned_data['favorite_product_id']
            product = get_object_or_404(Product, id=product_id)
            print(f"Product ID: {product.id}")  # Debug
            if product in favorite_.products.all():
                favorite_.products.remove(product)
                print(f"Product {product.id} removed from favorites.")  # Debug
            else:
                favorite_.products.add(product)
                print(f"Product {product.id} added to favorites.")  # Debug
            return redirect('home')
        else:
            user_profile = UserProfile.objects.get(user=request.user)

    products = products.filter(seller__is_active=True).exclude(sold=True)

    return render(request, 'home.html', {
        'form': form,
        'favorite_form': favorite_form,
        'products': products,
        'selected_teams': teams,
        'selected_types': product_types,
        'favorites_ids': favorites,
        'profile': user_profile,
        'user': request.user,
        'offer_count' : getOffersCount(request)
    })



def createAccount(request):
    if request.method == 'POST':
        form = CreateAccountForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password1']

            user = form.save(commit=True)

            group = Group.objects.get(name='Users')
            user.groups.add(group)

            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                return redirect('/')
            else:
                return render(request, 'createAccount.html', {'form': form, 'error': 'Authentication failed', "offer_count": getOffersCount(request)})

        else:
            return render(request, 'createAccount.html', {'form': form, 'error': 'Form is not valid', "offer_count": getOffersCount(request)})

    else:
        form = CreateAccountForm()
    return render(request, 'createAccount.html', {'form': form, 'error': False, 'offer_count' : getOffersCount(request),})

@login_required(login_url='/login/')
def myProfile(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    user = User.objects.get(id=request.user.id)
    following = Following.objects.filter(following=user)
    followers = Following.objects.filter(followed_id=user.id)

    selling = Product.objects.filter(seller_id=request.user.id).exclude(sold=True)
    profile = UserProfile.objects.get(user=request.user)

    tparams = {"user" : user, "following" : following, "followers" : followers, "products" : selling, "profile" : profile, 'offer_count' : getOffersCount(request)  }

    return render(request, 'myProfile.html', tparams)

def viewProfile(request, username):
    if verifyIfAdmin(request):
        return redirect("/admin")
    profile_user = User.objects.get(username=username)
    is_banned = not profile_user.is_active
    print(is_banned)

    favorite_form = FavoriteForm(request.POST or None)

    following = Following.objects.filter(following_id=profile_user.id)
    followers = Following.objects.filter(followed_id=profile_user.id)
    print(followers)
    selling = Product.objects.filter(seller_id=profile_user.id).exclude(sold=True)
    profile = UserProfile.objects.get(user=profile_user)

    if request.user.is_authenticated:
        favorite_, _ = Favorite.objects.get_or_create(user=request.user)
        favorites = favorite_.products.values_list('id', flat=True)

        if favorite_form.is_valid():
            product_id = favorite_form.cleaned_data['favorite_product_id']
            product = get_object_or_404(Product, id=product_id)
            print(f"Product ID: {product.id}")  # Debug
            if product in favorite_.products.all():
                favorite_.products.remove(product)
                print(f"Product {product.id} removed from favorites.")  # Debug
            else:
                favorite_.products.add(product)
                print(f"Product {product.id} added to favorites.")  # Debug
            return redirect('profile', username=username)



        print("Aconteceu")
        # Report form handling
        if request.method == 'POST' and 'report_user' in request.POST:
            print("Report user")
            report_form = ReportForm(request.POST)

            report_form.instance.sent_by = get_object_or_404(UserProfile,user=request.user)
            report_form.instance.reporting = get_object_or_404(UserProfile,user=profile_user)
            if report_form.is_valid():
                print("Valid Report form")
                report = report_form.save(commit=False)
                report.save()
                messages.success(request, 'Usuário reportado com sucesso.')
                return redirect('profile', username=username)
            else:
                print("Form errors:", report_form.errors)
        else:
            report_form = ReportForm()

        user = User.objects.get(id=request.user.id)
        if user == profile_user:
            return myProfile(request)
        follows=False
        for f in followers:
            print(user.username, " == ", f.following.username)
            if user.username == f.following.username:
                follows = True
                print("follows true")

        logged = UserProfile.objects.get(user=request.user)
        tparams = {"is_banned": is_banned,"user": user,'favorite_form': favorite_form,'favorites_ids': favorites, "profile_user": profile_user, "following": following, "followers": followers, "products": selling, 'profile': logged, "view_profile":profile, "follows":follows, "offer_count": getOffersCount(request), "report_form": report_form}
    else:
        tparams = {"is_banned": is_banned,"profile_user": profile_user, "following": following, "followers": followers,"products": selling,"view_profile":profile, "offer_count": getOffersCount(request)}

    return render(request, 'profile.html', tparams)

@login_required(login_url='/login/')
def pubProduct(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    user_profile = UserProfile.objects.get(user=request.user)
    if request.method == 'POST':
        form = ProductForm(request.POST,request.FILES)
        print(form.errors)
        if form.is_valid():
            print("form is valid")
            if request.user.is_authenticated:
                print("is authenticated")
                name = form.cleaned_data['name']
                description = form.cleaned_data['description']
                price = form.cleaned_data['price']
                team = form.cleaned_data['team']
                category = form.cleaned_data['category']
                size = form.cleaned_data['size']
                image = form.cleaned_data['image']

                seller = request.user

                product = Product(name=name, description=description, price=price, team=team, seller=seller, image=image)
                product.save()

                if category == '1':  # Camisola
                    if size in ['XS', 'S', 'M', 'L', 'XL', 'XXL']:
                        camisola = Jersey(product=product, size=size)
                        camisola.save()
                elif category == '2':  # Calções
                    if size in ['XS', 'S', 'M', 'L', 'XL', 'XXL']:
                        shorts = Shorts(product=product, size=size)
                        shorts.save()
                elif category == '3':  # Meias
                    if size in ['XS', 'S', 'M', 'L', 'XL', 'XXL']:
                        socks = Socks(product=product, size=size)
                        socks.save()
                elif category == '4':  # Chuteira
                    try:
                        size = int(size)
                    except ValueError:
                        return render(request, 'publishProduct.html', {'form': form, 'error': True, "offer_count": getOffersCount(request), "profile": user_profile})

                    if size in [30,31,32,33,34,35,36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,48]:
                        boots = Boots(product=product, size=size)
                        boots.save()

                return redirect('/')
        else:
            return render(request, 'publishProduct.html', {'form': form, 'error': True, "offer_count": getOffersCount(request), "profile": user_profile})
    else:
        form = ProductForm()
    return render(request, 'publishProduct.html', {'form': form, 'error': False, "offer_count" : getOffersCount(request), "profile": user_profile})

@login_required
def follow_user(request, username):
    user_to_follow = get_object_or_404(User, username=username)
    if not Following.objects.filter(following=request.user, followed=user_to_follow).exists():
        Following.objects.create(following=request.user, followed=user_to_follow)
    return redirect('profile', username=username)

@login_required
def unfollow_user(request, username):
    user_to_unfollow = get_object_or_404(User, username=username)
    Following.objects.filter(following=request.user, followed=user_to_unfollow).delete()
    return redirect('profile', username=username)

def userlist(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    form = SearchUserForm(request.POST or None)
    query = None
    all_users = None
    all_user_profiles = None
    myprofile = None
    if request.user.is_authenticated:
        myprofile = UserProfile.objects.get(user=request.user)

    popular_users = (
        User.objects.annotate(num_followers=Count('followers_set'))
        .order_by('-num_followers')[:10]
    )

    popular_users_profiles = UserProfile.objects.filter(user__in=popular_users)

    if request.method == 'POST' and form.is_valid():
        query = form.cleaned_data['query']
        all_users = User.objects.filter(username__icontains=query)
        print(all_users)
        all_user_profiles = UserProfile.objects.filter(user__in=all_users)
        print(all_user_profiles)

    # Render the template with the user data and profiles
    return render(request, 'userList.html', {
        'form': form,
        'popular_users': popular_users,
        'popular_users_profiles': popular_users_profiles,
        'all_users': all_users,
        'all_user_profiles': all_user_profiles,
        'query': query,
        'offer_count' : getOffersCount(request),
        'profile' : myprofile
    })




def detailedProduct(request, id):
    if verifyIfAdmin(request):
        return redirect("/admin")
    error = ""
    product = Product.objects.get(id=id)
    report_form = ReportForm()
    print("product")
    print(product)
    if Jersey.objects.filter(product=product).exists():
        print("Cami")
        category = "camisola"
        p = Jersey.objects.get(product=product)
    elif Shorts.objects.filter(product=product).exists():
        print("Shor")
        category = "calções"
        p = Shorts.objects.get(product=product)
    elif Socks.objects.filter(product=product).exists():
        print("Mei")
        category = "meias"
        p = Socks.objects.get(product=product)
    elif Boots.objects.filter(product=product).exists():
        print("Chut")
        category = "chuteiras"
        p = Boots.objects.get(product=product)


    sellerProfile = UserProfile.objects.get(user = product.seller)
    try:
        user = User.objects.get(id=request.user.id)
        print(user)
        userProfile = UserProfile.objects.get(user__id=request.user.id)
        print(userProfile)
    except User.DoesNotExist or UserProfile.DoesNotExist:
        user = None
        userProfile = None
    if request.method == 'POST' and 'proposta' in request.POST:
        form = ListingOffer(userProfile, product, request.POST, request.FILES)
        if form.is_valid():
            print("valid")
            payment_method = form.cleaned_data['payment_method']
            delivery_method = form.cleaned_data['delivery_method']
            address = form.cleaned_data['custom_address']
            value = form.cleaned_data['value']
            buyer = userProfile
            sent_by = userProfile
            offer = Offer(buyer=buyer, product=product, value=value, address=address, payment_method=payment_method, delivery_method=delivery_method, sent_by=sent_by)
            if (payment_method == "store_credit"):
                buyer.wallet -= offer.value
                buyer.save()
            offer.save()
            return redirect('/')
    form = ListingOffer(userProfile, product)

    if request.user.is_authenticated:
        # Report form handling
        if request.method == 'POST' and 'report_product' in request.POST:
            report_form = ReportForm(request.POST)

            report_form.instance.sent_by = get_object_or_404(UserProfile,user=request.user)
            report_form.instance.product = product
            if report_form.is_valid():
                report = report_form.save(commit=False)
                report.save()
                messages.success(request, 'Produto reportado com sucesso.')
                return redirect('detailedproduct',id=id)
            else:
                print("Form errors:", report_form.errors)
        else:
            report_form = ReportForm()
    else:
        error = "Login necessário"
    if user and user.id == p.product.seller.id:
        error = "Próprio produto"


    tparams = {"product": p, 'form': form, 'profile': userProfile, 'user' : user, 'offer_count' : getOffersCount(request), 'sellerProfile': sellerProfile, 'category': category, "report_form": report_form, "error": error}
    return render(request, 'productDetailed.html', tparams)

@login_required
def offers(request, action=None, id=None):
    if verifyIfAdmin(request):
        return redirect("/admin")
    user = User.objects.get(id=request.user.id)
    userProfile = UserProfile.objects.get(user__id=request.user.id)
    if not action is None:
        if action == 'accept':
            notifySuccess(id)
        elif action == 'reject':
            notifyFailed(id)
        elif action == 'counter':
            if request.method == 'POST':
                form = ListingOffer(userProfile, None, request.POST, request.FILES)
                print(form.errors)
                print(form.cleaned_data['address_choice'])
                print(form.cleaned_data['value'])
                print(form.cleaned_data['delivery_method'])
                print(form.cleaned_data['payment_method'])
                print(form.cleaned_data['custom_address'])
                if form.is_valid():
                    print("valid")
                    payment_method = form.cleaned_data['payment_method']
                    delivery_method = form.cleaned_data['delivery_method']
                    address = form.cleaned_data['custom_address']
                    value = form.cleaned_data['value']
                    offer = Offer.objects.get(id=id)
                    offer.payment_method = payment_method
                    offer.delivery_method = delivery_method
                    offer.address = address
                    offer.value = value
                    offer.sent_by = userProfile
                    offer.save()
                    print("saved")
        return redirect('/offers')
    form = ListingOffer(userProfile, None)
    madeOffers = Offer.objects.filter(sent_by__user_id=request.user.id).filter(offer_status__exact='in_progress')
    receivedOffers = Offer.objects.filter(product__seller_id=request.user.id) | Offer.objects.filter(buyer__user_id=request.user.id)
    receivedOffersFiltered = receivedOffers.exclude(sent_by__user_id=request.user.id).filter(offer_status__exact='in_progress')
    acceptedOffers = receivedOffers.filter(offer_status__exact='accepted').exclude(paid=True, delivered=True) | madeOffers.filter(offer_status__exact='accepted').exclude(paid=True, delivered=True)
    processedOffers = receivedOffers.filter(offer_status__exact='rejected') | madeOffers.filter(offer_status__exact='rejected') | Offer.objects.filter(paid=True, delivered=True, sent_by__user_id=request.user.id)
    tparams = {"profile": userProfile, "user": user, 'offers_received': receivedOffersFiltered, 'offers_made': madeOffers, 'offers_accepted': acceptedOffers, 'offers_processed': processedOffers, 'form': form, 'offer_count' : getOffersCount(request)}
    return render(request, 'offersTemplate.html', tparams)

def acceptOffer(request, id):
    return offers(request, 'accept', id)

def rejectOffer(request, id):
    return offers(request, 'reject', id)

def counterOffer(request, id):
    offer = Offer.objects.get(id=id)
    if offer.payment_method == "store_credit":
        if offer.sent_by.id != offer.buyer.id:
            offer.buyer.wallet -= offer.value
        else:
            offer.buyer.wallet += offer.value
        offer.buyer.save()
    return offers(request, 'counter', id)

def retractOffer(request, id):
    offer = Offer.objects.get(id=id)
    if offer.payment_method == "store_credit" and not offer.product.sold:
        if offer.sent_by.id == offer.buyer.id:
            offer.buyer.wallet += offer.value
        offer.buyer.save()
    offer.delete()
    return redirect("/offers/")

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
    return redirect("/offers/")

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
    return redirect("/offers/")

#Funções auxiliares
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

@login_required
def walletLogic(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    userinfo = UserProfile.objects.get(user=request.user)
    depositoform = DepositForm()
    levantamentoform = WithdrawalForm()

    return render(request, 'wallet.html', {
        'depositoform': depositoform,
        'levantamentoform': levantamentoform,
        'profile': userinfo,
        'offer_count': getOffersCount(request)
    })

@login_required
def deposit_money(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    userinfo = UserProfile.objects.get(user=request.user)
    depositoform = DepositForm(request.POST or None)

    if request.method == "POST" and depositoform.is_valid():
        deposit_amount = depositoform.cleaned_data['deposit_amount']
        userinfo.wallet += deposit_amount
        userinfo.save()
        return redirect('wallet')

    levantamentoform = WithdrawalForm()
    return render(request, 'wallet.html', {
        'depositoform': depositoform,
        'levantamentoform': levantamentoform,
        'profile': userinfo,
        'offer_count': getOffersCount(request)
    })

@login_required
def withdraw_money(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    userinfo = UserProfile.objects.get(user=request.user)
    levantamentoform = WithdrawalForm(request.POST or None)

    if request.method == "POST" and levantamentoform.is_valid():
        withdrawal_amount = levantamentoform.cleaned_data['withdrawal_amount']
        if withdrawal_amount <= userinfo.wallet:
            userinfo.wallet -= withdrawal_amount
            userinfo.save()
        return redirect('wallet')

    depositoform = DepositForm()
    return render(request, 'wallet.html', {
        'depositoform': depositoform,
        'levantamentoform': levantamentoform,
        'profile': userinfo,
        'offer_count': getOffersCount(request)
    })

@login_required
def account(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    image_form = UploadProfilePicture(request.POST)
    user = request.user
    account = UserProfile.objects.get(user=user)

    return render(request, 'account.html', {'user':user, 'account': account,'offer_count' : getOffersCount(request),'profile': UserProfile.objects.get(user=request.user)})

@login_required
def accountSettings(request):
    if verifyIfAdmin(request):
        return redirect("/admin")
    if request.method == 'GET':
        user = request.user
        account = UserProfile.objects.get(user=user)
        image_form = UploadProfilePicture()
        user_form = UpdateUser(initial={'email': user.email, 'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name})
        profile_form = UpdateProfile(initial={'address':account.address, 'phone':account.phone})
        password_form = UpdatePassword()
        return render(request, 'account.html', {'user': user, 'profile':account,'image_form': image_form, 'user_form': user_form,
                                                         'profile_form': profile_form, 'password_form': password_form,'offer_count' : getOffersCount(request)})
    elif request.method == 'POST':
        if 'image' in request.FILES:
            user=request.user
            account = UserProfile.objects.get(user=user)
            image_form=UploadProfilePicture(request.POST, request.FILES)
            if image_form.is_valid():
                file = request.FILES['image']

                if file:
                    account.image = file
                    account.update_image(file)
                    account.save()
                    return redirect('/myprofile/settings')
                else:
                    image_form = UploadProfilePicture()
                    print(image_form.errors)
                    return render(request, 'account.html', {'user': user,'offer_count' : getOffersCount(request), 'profile':account, 'image_form': image_form})

        elif  'profile_change' in request.POST:
            # get the form info
            user=request.user
            user_profile = UserProfile.objects.get(user=user)
            user_form = UpdateUser(request.POST)
            profile_form = UpdateProfile(request.POST)
            if profile_form.is_valid() and user_form.is_valid():
                if user.username != user_form.cleaned_data['username']:
                    user.username = user_form.cleaned_data['username']
                if user.email != user_form.cleaned_data['email']:
                    user.email = user_form.cleaned_data['email']
                if user.first_name != user_form.cleaned_data['first_name']:
                    user.first_name = user_form.cleaned_data['first_name']
                if user.last_name != user_form.cleaned_data['last_name']:
                    user.last_name = user_form.cleaned_data['last_name']
                user.save()
                if user_profile.phone != profile_form.cleaned_data['phone']:
                    user_profile.phone = profile_form.cleaned_data['phone']
                if user_profile.address != profile_form.cleaned_data['address']:
                    user_profile.address = profile_form.cleaned_data['address']
                user_profile.save()

                return redirect('/myprofile/settings')

        elif 'password_change' in request.POST:
            user = request.user
            account = UserProfile.objects.get(user=user)
            password_form = UpdatePassword(request.POST)
            image_form = UploadProfilePicture()
            user_form = UpdateUser(initial={'email': user.email, 'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name})
            profile_form = UpdateProfile(initial={'address': account.address, 'phone': account.phone})
            if password_form.is_valid():
                if password_form.cleaned_data['new'] == password_form.cleaned_data['confirm']:
                    request.user.set_password(password_form.cleaned_data['new'])
                    user.save()
                    print('Password changed successfully!')
                    return render(request, 'account.html', {'user': user, 'profile':account, 'password_form': password_form,
                                                                     'image_form': image_form,
                                                                     'profile_form': profile_form,
                                                                     'user_form': user_form,
                                                                     'success': 'Password changed successfully!','offer_count' : getOffersCount(request)})
                else:
                    print('Passwords do not match!')
                    return render(request, 'account.html', {'user': user, 'profile':account, 'password_form': password_form,
                                                                     'image_form': image_form,
                                                                     'profile_form': profile_form,
                                                                     'user_form': user_form,
                                                                     'error': 'Passwords do not match!','offer_count' : getOffersCount(request)})

            else:
                return render(request, 'account.html', {'user': user, 'profile':account, 'password_form': password_form,
                                                                 'image_form': image_form,
                                                                 'profile_form': profile_form,
                                                                 'user_form': user_form,
                                                                 'error': 'Invalid form!','offer_count' : getOffersCount(request)})


# ------------------- REST API ------------------- #

@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def get_users(request):
    username=None
    print(request.data)
    if 'username' in request.GET:
        print("username")
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
            # You can serialize the user data here and return it
        except UserProfile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = UserProfileSerializer(user, many=False)
        return Response(serializer.data)

 
    elif request.method == 'PUT':
        try:
            password = request.data.get('password')
            image_base64 = request.data.get('image_base64')  # Get Base64 image from request
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
    print(request.data)
    offer_serializer = OfferSerializer(data=request.data)
    offer_serializer.is_valid()
    offer = offer_serializer.create(validated_data=request.data)
    offer.buyer.wallet -= Decimal(offer.value)
    offer.buyer.save()
    print("myoffer", offer)
    new_offer_serializer = OfferSerializer(offer, many=False)
    print(new_offer_serializer.data)
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
        print(serializer.data)
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
        print(request.data)
        if 'username' in request.GET:
            username = request.GET["username"]
            products = Product.objects.filter(seller__username=username)
        elif 'user_id' in request.GET:
            user_id = request.GET['user_id']
            products = Product.objects.filter(seller__id=user_id)
        else:
            products = Product.objects.all()
        num = 10
        #try:
        #    num = int(request.GET.get('num', 10))  # Default to 10 if not provided
        #    page = int(request.GET.get('page', 1))  # Default to 1 if not provided
        #    start = (page - 1) * num
        #    end = start + num
        #    products = products[start:end]
        #except ValueError as e:
        #    return Response({'error': 'Invalid pagination parameters'}, status=status.HTTP_400_BAD_REQUEST)
        
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
            # Fetch the favorite object associated with the user
            favorite = Favorite.objects.get(user_id=user_id)
        except Favorite.DoesNotExist:
            return Response(
                {"detail": "Favorites not found for this user."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Retrieve all products in the user's favorites
        products = favorite.products.all()
        print("PRODUCTs FOR USER:", favorite.user, " -> ", products)
        serializer = ProductSerializer(products, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        if product_id is None:
            return Response(
                {"detail": "Product ID is required to add to favorites."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Fetch the favorite object and the product to be added
            favorite = Favorite.objects.get(user_id=user_id)
            product = Product.objects.get(id=product_id)

            # Add the product to the user's favorites (many-to-many relationship)
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
            # Fetch the favorite object and the product to be removed
            favorite = Favorite.objects.get(user_id=user_id)
            product = Product.objects.get(id=product_id)

            # Remove the product from the user's favorites
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

        print("FOLLOWING:",followed_users)
        return Response(followed_users)

    elif request.method == 'POST':
        print("Dados recebidos:", request.data)
        serialize = FollowingSerializer(data=request.data)
        if serialize.is_valid():
            serialize.save()
            return Response(serialize.data, status=status.HTTP_201_CREATED)
        print("Erros:", serialize.errors)
        return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        serialize = FollowingSerializer(data=request.data)
        print(serialize)
        if serialize.is_valid():
            following_data = serialize.validated_data
            following_user = following_data.get('following')
            followed_user = following_data.get('followed')

            following_relations = Following.objects.filter(following=following_user, followed=followed_user)

            if following_relations.exists():
                print(0)
                deleted_count, _ = following_relations.delete()
                if deleted_count > 0:
                    print(1)
                    return Response(request.data)
                else:
                    print(2)
                    return Response({'error': 'No matching following relationship found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                print(3)
                return Response({'error': 'Following relationship not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(serialize.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def followers(request, id):
    if request.method == 'GET':
        try:
            # Get the followers (users following the given user)
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
        print("FOLLOWERS:",following_users)
        return Response(following_users)

    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)



#@api_view(['GET'])
#def follows(request):
#    username=None
#    if 'username' in request.GET:
#        print("username")
#        username = request.GET['username']
#    if username:
#        #if verifyIfAdmin(request):
#            #return redirect("/admin")
#        if request.method == 'GET':
#            try:
#                following = Following.objects.filter(following__username = username)
#                followers = Following.objects.filter(followed__username=username)
#                
#            except Following.DoesNotExist:
#                return Response(status=status.HTTP_404_NOT_FOUND)
#            following_serializer = FollowingSerializer(following, many=True)
#            followers_serializer = FollowingSerializer(followers, many=True)
#
#            # Extract and restructure serialized data
#            following_data = [
#                entry['followed'] for entry in following_serializer.data
#            ]
#            followers_data = [
#                entry['following'] for entry in followers_serializer.data
#            ]
#            # Prepare the response data
#            response_data = {
#                'following': following_data,
#                'followed': followers_data
#            }
#            return Response(response_data)
#        
#        elif request.method == 'POST':
#            follow = request.data
#            serialize = FollowingSerializer(follow)
#            if serialize.is_valid:
#                serialize.create(follow)
#                return Response(follow.data)
#        
#        elif request.method == 'DELETE':
#            follow = request.data
#            serialize = FollowingSerializer(follow)
#            if serialize.is_valid:
#                serialize.remove(follow)
#                return Response(follow.data)
#
#    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

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
            print(username, password)
            user = authenticate(username=username, password=password)
            if user is not None:
                user_profile = UserProfile.objects.get(user=user)
                user_serializer = UserProfileSerializer(user_profile, many=False)
                token, _ = Token.objects.get_or_create(user=user)
                return Response({"userProfile": user_serializer.data, "token": token.key}, status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
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
        print("username")
        username = request.GET['username']
    if username:
        user = User.objects.get(username=username)
        print(username)
        print(user)
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
                print(offer_id)
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
            print(action)
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

        # Track counts of reports for each product
        seen_products = {}
        for report in all_reports.filter(product__isnull=False):
            product_id = report.product.id
            if product_id not in seen_products:
                new_report = ReportSerializer(report,many=False)
                seen_products[product_id] = {'report': new_report.data, 'count': 1}
            else:
                seen_products[product_id]['count'] += 1
        product_reports = list(seen_products.values())
        #print(product_reports)
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
        #print(user_reports)
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
            # Get the product by ID or return 404
            product = get_object_or_404(Product, id=product_id)

            # Perform deletion
            product.delete()

            # Return success response
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
    else:
        user.is_active = True
        action = "unbanned"
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
    print(request.data,"\n\n\n\n\n")
    """API endpoint to create a new report."""
    report_serializer = ReportSerializer(data=request.data)
    print(report_serializer)
    report = report_serializer.create(validated_data=request.data)
    print("\n\n\n\n\n",report)
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

# ------------------- REST API ------------------- #