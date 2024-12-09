from rest_framework import serializers
from AmorCamisola.models import User, UserProfile, Following, Product, Report, Favorite, Jersey, Shorts, Socks, Boots, Offer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False)

    class Meta:
        model = UserProfile
        fields = ['user', 'address', 'phone', 'image', 'wallet']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        if user_data:
            user, _ = User.objects.get_or_create(**user_data)
            validated_data['user'] = user
        
        user_profile = UserProfile.objects.create(**validated_data)

        return user_profile
    
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
    
class FollowingSerializer(serializers.ModelSerializer):
    follower = UserProfileSerializer(many=False)
    followed = UserProfileSerializer(many=False)

    class Meta:
        model = Following
        fields = ['follower', 'followed']

    def create(self, validated_data):
        follower_data = validated_data.pop('follower')
        followed_data = validated_data.pop('followed')
        if follower_data:
            follower, _ = UserProfile.objects.get_or_create(**follower_data)
            validated_data['follower'] = follower
        if followed_data:
            followed, _ = UserProfile.objects.get_or_create(**followed_data)
            validated_data['followed'] = followed
        
        following = Following.objects.create(**validated_data)

        return following
    
    def update(self, instance, validated_data):
        follower_data = validated_data.pop('follower')
        followed_data = validated_data.pop('followed')
        if follower_data:
            follower = instance.follower
            for attr, value in follower_data.items():
                setattr(follower, attr, value)
            follower.save()
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

    class Meta:
        model = Product
        fields = ['id', 'name', 'seller', 'image', 'price', 'team', 'description', 'sold', 'is_active']

    def create(self, validated_data):
        seller_data = validated_data.pop('seller')
        if seller_data:
            seller, _ = User.objects.get_or_create(**seller_data)
            validated_data['seller'] = seller
        
        product = Product.objects.create(**validated_data)

        return product
    
    def update(self, instance, validated_data):
        seller_data = validated_data.pop('seller')
        if seller_data:
            seller = instance.seller
            for attr, value in seller_data.items():
                setattr(seller, attr, value)
            seller.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
class ReportSerializer(serializers.ModelSerializer):
    sent_by = UserProfileSerializer(many=False)
    reporting = UserProfileSerializer(many=False)
    product = ProductSerializer(many=False)

    class Meta:
        model = Report
        fields = ['sent_by', 'reporting', 'product', 'reasons', 'description']

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
    user = UserProfileSerializer(many=False)
    products = ProductSerializer(many=True)

    class Meta:
        model = Favorite
        fields = ['user', 'products']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        if user_data:
            user, _ = UserProfile.objects.get_or_create(**user_data)
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
        fields = ['buyer', 'product', 'value', 'payment_method', 'delivery_method', 'address', 'sent_by', 'offer_status', 'delivered']

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

    