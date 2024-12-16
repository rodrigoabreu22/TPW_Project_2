import base64
import os
import uuid
from django.conf import settings
from rest_framework import serializers
from AmorCamisola.models import User, UserProfile, Following, Product, Report, Favorite, Jersey, Shorts, Socks, Boots, Offer
from django.core.files.base import ContentFile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'address', 'phone', 'image', 'wallet']

    def create(self, validated_data, password):
        user_data = validated_data.pop('user')
        if user_data:
            user_data['id'] = User.objects.count() + 1
            user, _ = User.objects.get_or_create(**user_data)
            if password:
                user.set_password(password)
                user.save()
            validated_data['user'] = user
        else:
            return None
        validated_data['id'] = UserProfile.objects.count() + 1
        user_profile = UserProfile.objects.create(**validated_data)

        return user_profile
    
    def update(self, instance, validated_data, password=None, image_base64=None):
        # Extract user data and exclude the 'id' field
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            user_data.pop('id', None)  # Ensure the user ID is not updated
            for attr, value in user_data.items():
                setattr(user, attr, value)
            if password:
                user.set_password(password)
            user.save()

        # Handle Base64 image upload
        if image_base64:
            validated_data.pop('image', None)
            print("entrou")
            image_path = save_base64_image(image_base64, isUser=True)
            if image_path:
                print(image_path)
                instance.image = image_path  # Update the profile image only if the new image is saved successfully
        else: 
            validated_data.pop('image', None)

        # Update other fields of the UserProfile instance, excluding 'id' and 'image'
        validated_data.pop('id', None)  # Ensure the profile ID is not updated
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()

        return instance


    
class FollowingSerializer(serializers.ModelSerializer):
    following = UserSerializer(many=False)
    followed = UserSerializer(many=False)

    class Meta:
        model = Following
        fields = ['following', 'followed']

    def create(self, validated_data):
        following_data = validated_data.pop('following')
        followed_data = validated_data.pop('followed')
        if following_data:
            following, _ = User.objects.get_or_create(**following_data)
            validated_data['following'] = following
        if followed_data:
            followed, _ = User.objects.get_or_create(**followed_data)
            validated_data['followed'] = followed

        following_instance = Following.objects.create(**validated_data)

        return following_instance

    def update(self, instance, validated_data):
        following_data = validated_data.pop('following')
        followed_data = validated_data.pop('followed')
        if following_data:
            following = instance.following
            for attr, value in following_data.items():
                setattr(following, attr, value)
            following.save()
        if followed_data:
            followed = instance.followed
            for attr, value in followed_data.items():
                setattr(followed, attr, value)
            followed.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(many=False)
    category = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'seller', 'image', 'price', 'team', 'description', 'sold', 'is_active', 'category', 'size']

    def get_category(self, obj):
        if hasattr(obj, 'jersey'):
            return 'Camisola'
        elif hasattr(obj, 'shorts'):
            return 'Calção'
        elif hasattr(obj, 'socks'):
            return 'Meia'
        elif hasattr(obj, 'boots'):
            return 'Chuteira'
        return None

    def get_size(self, obj):
        if hasattr(obj, 'jersey'):
            return obj.jersey.size
        elif hasattr(obj, 'shorts'):
            return obj.shorts.size
        elif hasattr(obj, 'socks'):
            return obj.socks.size
        elif hasattr(obj, 'boots'):
            return obj.boots.size
        return None

    def create(self, validated_data):
        # Process `seller` data
        seller_data = validated_data.pop('seller', None)
        category = validated_data.pop('category', None)
        size = validated_data.pop('size', None)
        image_base64 = validated_data.pop('image_base64', None)  # Remove `image_base64
        
        validated_data['id'] = Product.objects.count() + 1
    
        if seller_data:
            print("--------------_> ",seller_data)
            seller, _ = User.objects.get_or_create(**seller_data)
            print("-------------------------->", seller)
            validated_data['seller'] = seller

        if image_base64:
            validated_data['image']=save_base64_image(image_base64, False) 
            
        product = Product.objects.create(**validated_data)
    
        if category == 'Camisola':
            return JerseySerializer(Jersey.objects.create(product=product, size=size))
        elif category == 'Calção':
            return ShortsSerializer(Shorts.objects.create(product=product, size=size))
        elif category == 'Meia':
            return SocksSerializer(Socks.objects.create(product=product, size=size))
        elif category == 'Chuteira':
            return BootsSerializer(Boots.objects.create(product=product, size=size))
    

def save_base64_image(base64_string, isUser):
    """Decode and save the image to media directory."""
    # Decode base64 string
    try:
        # Strip the prefix if provided
        if "data:image" in base64_string:
            header, base64_string = base64_string.split(',', 1)
        image_data = base64.b64decode(base64_string)

        # Create unique name for image
        if isUser:
            file_name = f"users/{uuid.uuid4()}.png"
        else:
            file_name = f"produtos/{uuid.uuid4()}.png"  # Ensure uniqueness
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)

        # Save image
        with open(file_path, 'wb') as f:
            f.write(image_data)

        return file_name  # Return the saved image file name
    except Exception as e:
        print("Error saving Base64 image:", e)
    return None


    
class ReportSerializer(serializers.ModelSerializer):
    sent_by = UserProfileSerializer(many=False)
    reporting = UserProfileSerializer(many=False)
    product = ProductSerializer(many=False)

    class Meta:
        model = Report
        fields = ['id','sent_by', 'reporting', 'product', 'reasons', 'description']

    def create(self, validated_data):
        sent_by_data = validated_data.pop('sent_by')
        reporting_data = validated_data.pop('reporting')
        product_data = validated_data.pop('product')
        if sent_by_data:
            sent_by, _ = UserProfile.objects.get_or_create(**sent_by_data)
            validated_data['sent_by'] = sent_by
        if reporting_data:
            reporting, _ = UserProfile.objects.get_or_create(**reporting_data)
            validated_data['reporting'] = reporting
        if product_data:
            product, _ = Product.objects.get_or_create(**product_data)
            validated_data['product'] = product
        
        report = Report.objects.create(**validated_data)

        return report
    
    def update(self, instance, validated_data):
        sent_by_data = validated_data.pop('sent_by')
        reporting_data = validated_data.pop('reporting')
        product_data = validated_data.pop('product')
        if sent_by_data:
            sent_by = instance.sent_by
            for attr, value in sent_by_data.items():
                setattr(sent_by, attr, value)
            sent_by.save()
        if reporting_data:
            reporting = instance.reporting
            for attr, value in reporting_data.items():
                setattr(reporting, attr, value)
            reporting.save()
        if product_data:
            product = instance.product
            for attr, value in product_data.items():
                setattr(product, attr, value)
            product.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class FavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False)
    products = ProductSerializer(many=True)

    class Meta:
        model = Favorite
        fields = ['user', 'products']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        if user_data:
            user, _ = User.objects.get_or_create(**user_data)
            validated_data['user'] = user
        
        favorite = Favorite.objects.create(**validated_data)

        return favorite
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user')
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class JerseySerializer(serializers.ModelSerializer):
    product = ProductSerializer(many=False)

    class Meta:
        model = Jersey
        fields = ['product', 'size']

    def create(self, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product, _ = Product.objects.get_or_create(**product_data)
            validated_data['product'] = product
        
        jersey = Jersey.objects.create(**validated_data)

        return jersey
    
    def update(self, instance, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product = instance.product
            for attr, value in product_data.items():
                setattr(product, attr, value)
            product.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class ShortsSerializer(serializers.ModelSerializer):
    product = ProductSerializer(many=False)

    class Meta:
        model = Shorts
        fields = ['product', 'size']

    def create(self, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product, _ = Product.objects.get_or_create(**product_data)
            validated_data['product'] = product
        
        shorts = Shorts.objects.create(**validated_data)

        return shorts
    
    def update(self, instance, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product = instance.product
            for attr, value in product_data.items():
                setattr(product, attr, value)
            product.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class SocksSerializer(serializers.ModelSerializer):
    product = ProductSerializer(many=False)

    class Meta:
        model = Socks
        fields = ['product', 'size']

    def create(self, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product, _ = Product.objects.get_or_create(**product_data)
            validated_data['product'] = product
        
        socks = Socks.objects.create(**validated_data)

        return socks
    
    def update(self, instance, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product = instance.product
            for attr, value in product_data.items():
                setattr(product, attr, value)
            product.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class BootsSerializer(serializers.ModelSerializer):
    product = ProductSerializer(many=False)

    class Meta:
        model = Boots
        fields = ['product', 'size']

    def create(self, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product, _ = Product.objects.get_or_create(**product_data)
            validated_data['product'] = product
        
        boots = Boots.objects.create(**validated_data)

        return boots
    
    def update(self, instance, validated_data):
        product_data = validated_data.pop('product')
        if product_data:
            product = instance.product
            for attr, value in product_data.items():
                setattr(product, attr, value)
            product.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class OfferSerializer(serializers.ModelSerializer):
    buyer = UserProfileSerializer(many=False)
    product = ProductSerializer(many=False)
    sent_by = UserProfileSerializer(many=False)

    class Meta:
        model = Offer
        fields = ['id', 'buyer', 'product', 'value', 'payment_method', 'delivery_method', 'address', 'sent_by', 'offer_status', 'delivered', 'paid']

    def create(self, validated_data):
        buyer_data = validated_data.pop('buyer')
        product_data = validated_data.pop('product')
        sent_by_data = validated_data.pop('sent_by')
        if buyer_data:
            buyer, _ = UserProfile.objects.get_or_create(**buyer_data)
            validated_data['buyer'] = buyer
        if product_data:
            product, _ = Product.objects.get_or_create(**product_data)
            validated_data['product'] = product
        if sent_by_data:
            sent_by, _ = UserProfile.objects.get_or_create(**sent_by_data)
            validated_data['sent_by'] = sent_by
        
        offer = Offer.objects.create(**validated_data)

        return offer
    
    def update(self, instance, validated_data):
        buyer_data = validated_data.pop('buyer')
        product_data = validated_data.pop('product')
        sent_by_data = validated_data.pop('sent_by')
        if buyer_data:
            buyer = instance.buyer
            for attr, value in buyer_data.items():
                setattr(buyer, attr, value)
            buyer.save()
        if product_data:
            product = instance.product
            for attr, value in product_data.items():
                setattr(product, attr, value)
            product.save()
        if sent_by_data:
            sent_by = instance.sent_by
            for attr, value in sent_by_data.items():
                setattr(sent_by, attr, value)
            sent_by.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

    