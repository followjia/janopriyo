'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Truck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'Invalid zip code'),
  country: z.string().min(2, 'Country is required'),
  paymentMethod: z.enum(['COD', 'Online'], {
    message: 'Select a payment method'
  }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalAmount, isHydrated } = useAppSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Bangladesh',
      paymentMethod: 'COD',
    },
  });

  useEffect(() => {
    async function fetchLoyaltyData() {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/settings')
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (settingsRes.ok) setSettings(await settingsRes.json());
      } catch (error) {
        console.error('Failed to fetch loyalty data');
      }
    }
    fetchLoyaltyData();
  }, []);

  const submissionSucceededRef = useRef(false);

  useEffect(() => {
    // Only redirect if hydration is complete and the cart is truly empty
    if (isHydrated && items.length === 0 && !loading && !submissionSucceededRef.current) {
      router.push('/shop');
    }
  }, [isHydrated, items, router, loading]);

  const onSubmit = async (values: CheckoutValues) => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
            product: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
        })),
        shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country
        },
        paymentMethod: values.paymentMethod,
        deliveryCharge: deliveryCharge,
        useWallet: useWallet,
        couponCode: appliedCoupon || undefined,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        submissionSucceededRef.current = true;
        
        if (values.paymentMethod === 'Online') {
          // Initialize SSLCommerz Payment
          const initRes = await fetch('/api/payment/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order._id }),
          });

          if (initRes.ok) {
            const { url } = await initRes.json();
            // Clear cart ONLY after successful payment initialization
            dispatch(clearCart());
            // Redirect to SSLCommerz Gateway
            window.location.href = url;
            return; // Stop further execution
          } else {
            const initError = await initRes.json();
            toast.error(initError.message || 'Failed to initialize payment gateway. Please try paying from your dashboard.');
            // Still clear cart if the order was created successfully
            dispatch(clearCart());
            router.push(`/checkout/success?id=${order._id}`);
          }
        } else {
          // COD Success - Clear cart and redirect
          dispatch(clearCart());
          toast.success('Order placed successfully!');
          router.push(`/checkout/success?id=${order._id}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred while placing your order');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code.trim()) return;
    
    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, totalAmount })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discountAmount);
        setAppliedCoupon(data.code);
        if (!codeToUse) toast.success(`Coupon "${data.code}" applied!`);
      } else {
        // If re-validating an already applied coupon, remove it
        if (codeToUse) {
          removeCoupon();
          toast.info(data.message || 'Coupon removed due to cart changes');
        } else {
          toast.error(data.message || 'Invalid coupon');
        }
      }
    } catch (error) {
      if (!codeToUse) toast.error('Failed to validate coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Re-validate coupon when cart total changes
  useEffect(() => {
    if (appliedCoupon && totalAmount > 0) {
      applyCoupon(appliedCoupon);
    }
  }, [totalAmount]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const city = form.watch('city');
  const state = form.watch('state');
  const isDhaka = city?.toLowerCase().includes('dhaka') || state?.toLowerCase().includes('dhaka');
  
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 0;
  const isFreeDelivery = freeDeliveryThreshold > 0 && totalAmount >= freeDeliveryThreshold;
  
  const chargeInsideDhaka = settings?.deliveryChargeInsideDhaka || 60;
  const chargeOutsideDhaka = settings?.deliveryChargeOutsideDhaka || 120;
  
  const deliveryCharge = items.length > 0 ? (isFreeDelivery ? 0 : (isDhaka ? chargeInsideDhaka : chargeOutsideDhaka)) : 0;
  
  const totalAfterCoupon = Math.max(0, totalAmount + deliveryCharge - couponDiscount);

  const walletAmountToUse = useWallet && profile?.walletBalance 
    ? Math.min(profile.walletBalance, totalAfterCoupon) 
    : 0;

  const finalTotal = totalAfterCoupon - walletAmountToUse;

  const potentialReward = (profile?.isSubscriptionActive && settings?.subscriptionConfig)
    ? Math.floor(finalTotal * (settings.subscriptionConfig.rewardPercentage / 100))
    : 0;

  // Show loading state or nothing while hydrating to prevent flash of "empty cart" redirect
  if (!isHydrated) return (
    <div className="container min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (items.length === 0) return null;

  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground mt-2">Complete your order by filling in the details below.</p>
          </div>

          <Form {...form}>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+880 1XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="House #123, Road #4, Sector #5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Dhaka" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Division</FormLabel>
                        <FormControl>
                          <Input placeholder="Dhaka" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="1230" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="COD" />
                              </FormControl>
                              <FormLabel className="font-bold flex-1 cursor-pointer">
                                Cash on Delivery (COD)
                                <p className="text-xs font-normal text-muted-foreground mt-1">Pay when you receive the product.</p>
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="Online" />
                              </FormControl>
                              <FormLabel className="font-bold flex-1 cursor-pointer">
                                Online Payment (SSLCommerz)
                                <p className="text-xs font-normal text-muted-foreground mt-1">Pay securely via Credit Card, bKash, or Rocket.</p>
                                <Badge variant="secondary" className="mt-2 text-[10px]">Recommended</Badge>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {profile && profile.walletBalance > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      Token Wallet
                    </CardTitle>
                    <CardDescription>Use your earned tokens for an instant discount.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          id="use-wallet" 
                          checked={useWallet}
                          onChange={(e) => setUseWallet(e.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="use-wallet" className="font-bold cursor-pointer">
                          Use Token Balance
                          <p className="text-xs font-normal text-muted-foreground">Available: ৳{profile.walletBalance}</p>
                        </label>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">- ৳{walletAmountToUse}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Verify your items before placing the order.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                {items.map((item, index) => (
                  <div key={item.productId ? `${item.productId}-${item.color ?? ''}-${item.size ?? ''}-${item.others ?? ''}` : index} className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded border bg-muted flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name || 'Product'} className="h-full w-full object-cover rounded" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} x ৳{Math.round(item.price)}</p>
                    </div>
                    <p className="text-sm font-bold">৳{Math.round(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              
              {/* Coupon Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon || applyingCoupon}
                    className="h-9 text-xs"
                  />
                  {appliedCoupon ? (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm" 
                      onClick={removeCoupon}
                      className="h-9 px-3"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => applyCoupon()} 
                      disabled={applyingCoupon || !couponCode}
                      className="h-9 px-4"
                    >
                      {applyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Coupon "{appliedCoupon}" active!
                  </p>
                )}
              </div>

              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{Math.round(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={isFreeDelivery ? "text-green-600 font-black" : "text-primary font-bold"}>
                    {isFreeDelivery ? 'FREE' : `৳${deliveryCharge}`}
                  </span>
                </div>
                {isFreeDelivery && (
                  <p className="text-[10px] text-green-600 font-bold text-right -mt-1">
                    Free shipping applied (Order ≥ ৳{freeDeliveryThreshold})
                  </p>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ৳{couponDiscount}</span>
                  </div>
                )}
                {walletAmountToUse > 0 && (
                  <div className="flex justify-between text-sm text-primary font-bold">
                    <span>Tokens Used</span>
                    <span>- ৳{walletAmountToUse}</span>
                  </div>
                )}
                <Separator className="mt-4" />
                <div className="flex justify-between text-lg font-black pt-2">
                  <span>Total</span>
                  <span className="text-primary">৳{Math.round(finalTotal)}</span>
                </div>
                {potentialReward > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Loyalty Perk</p>
                    <p className="text-xs font-bold">You will earn <span className="text-primary">৳{potentialReward}</span> tokens from this order!</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit"
                form="checkout-form"
                className="w-full h-12 rounded-full font-bold uppercase tracking-widest text-xs" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
                Place Your Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
