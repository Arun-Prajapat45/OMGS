'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { HiOutlineHeart, HiHeart, HiStar, HiOutlineShoppingCart, HiLightningBolt, HiCheck, HiTruck } from 'react-icons/hi';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import KonvaEditor from '@/components/editor/KonvaEditor';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export default function ProductDetailClient({ product }) {
  const dispatch = useDispatch();
  const { addAndOpenCart } = useCart();
  const template = product?.template?.templateJson || product?.template;


  const [selectedSize, setSelectedSize] = useState(template?.printSizes?.[0] || null);
  const [selectedThickness, setSelectedThickness] = useState(template?.thicknesses?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  const totalPrice = (selectedSize?.price || 0) + (selectedThickness?.price || 0);
  const discount = getDiscountPercentage(Math.round(totalPrice * 1.3), totalPrice);

  const [isUploading, setIsUploading] = useState(false);
  const [triggerExport, setTriggerExport] = useState(false);
  const [cartActionData, setCartActionData] = useState(null);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    setCartActionData('cart');
    setTriggerExport(true);
    setIsUploading(true);
    toast.loading('Preparing high-res design...', { id: 'upload-toast' });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    setCartActionData('buy');
    setTriggerExport(true);
    setIsUploading(true);
    toast.loading('Preparing high-res design...', { id: 'upload-toast' });
  };

  const handleHighResExport = async (highResUri) => {
    setTriggerExport(false);

    let finalImageUrl = highResUri || previewDataUrl;

    if (finalImageUrl && finalImageUrl.startsWith('data:')) {
      toast.loading('Saving design to cloud...', { id: 'upload-toast' });
      try {
        const res = await fetch(finalImageUrl);
        const blob = await res.blob();
        const file = new File([blob], `design-${product.id}.webp`, { type: 'image/webp' });
        
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await uploadRes.json();
        if (uploadRes.ok) {
          finalImageUrl = data.url || data.secureUrl || finalImageUrl;
          toast.success('Design saved!', { id: 'upload-toast' });
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (err) {
        toast.error('Failed to save to cloud. Using local image...', { id: 'upload-toast' });
        console.error('Cloudinary upload error:', err);
      }
    }

    const newDesignId = `design_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await addAndOpenCart({
      productId: product.id,
      designId: newDesignId,
      name: product.name,
      size: selectedSize.label,
      thickness: selectedThickness?.label,
      price: totalPrice,
      quantity,
      customData: { previewDataUrl: finalImageUrl, price: totalPrice },
      image: finalImageUrl,
    });

    setIsUploading(false);

    if (cartActionData === 'buy') {
      window.location.href = '/checkout';
    }
    setCartActionData(null);
  };

  const handleCheckDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryInfo({ days: '2-4 business days', free: true });
    } else {
      toast.error('Enter a valid 6-digit pincode');
    }
  };

  const handleExport = useCallback((dataUrl) => {
    setPreviewDataUrl(dataUrl);
  }, []);

  const FAQ_ITEMS = [
    { q: 'What material is used?', a: 'We use premium 3mm or 5mm crystal-clear acrylic with UV-resistant printing for stunning clarity and longevity.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 2-5 business days. Express options are available at checkout.' },
    { q: 'Can I return or exchange?', a: 'Since products are custom-made, we do not accept returns unless the product is damaged or defective.' },
    { q: 'How do I mount it on the wall?', a: 'Each print comes with pre-drilled holes and mounting hardware for easy installation.' },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* LEFT: Editor */}
          <div className="lg:sticky lg:top-24">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              {template ? (
                <KonvaEditor 
                  template={template} 
                  onExport={handleExport} 
                  shape={product.shape || 'rectangle'} 
                  triggerExport={triggerExport}
                  onHighResExport={handleHighResExport}
                />
              ) : (
                <div className="glass rounded-3xl p-12 text-center text-white/40">
                  <p>Template not found</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                </div>
                <span className="text-white/50 text-sm">4.9 (2.3k reviews)</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-white/60 text-sm leading-relaxed">{product.description || 'Premium custom acrylic print crafted with museum-quality precision.'}</p>
            </div>

            {/* Price */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">{formatPrice(totalPrice)}</span>
                <span className="text-xl text-white/40 line-through">{formatPrice(Math.round(totalPrice * 1.3))}</span>
                <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-bold">
                  -{discount}% OFF
                </span>
              </div>
              <p className="text-white/40 text-xs mt-1">Inclusive of all taxes • Free shipping above ₹499</p>
            </div>

            {/* Size Selection */}
            {template?.printSizes && (
              <div>
                <h3 className="font-semibold text-white mb-3">
                  Select Size
                  {selectedSize && <span className="text-white/50 text-sm font-normal ml-2">— {selectedSize.label}</span>}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.printSizes.map((size) => (
                    <button
                      key={size.label}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedSize?.label === size.label
                          ? 'gradient-primary border-primary-500 text-white glow'
                          : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white glass'
                        }`}
                    >
                      {size.label}
                      <span className="ml-2 text-xs opacity-70">{formatPrice(size.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thickness Selection */}
            {template?.thicknesses && template.thicknesses.length > 1 && (
              <div>
                <h3 className="font-semibold text-white mb-3">Thickness</h3>
                <div className="flex flex-wrap gap-2">
                  {template.thicknesses.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setSelectedThickness(t)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedThickness?.label === t.label
                          ? 'gradient-primary border-primary-500 text-white'
                          : 'border-white/15 text-white/60 hover:border-white/40 glass'
                        }`}
                    >
                      {t.label}
                      {t.price > 0 && <span className="ml-1 text-xs opacity-70">+{formatPrice(t.price)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock & Quantity */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <HiCheck className="w-4 h-4" /> In Stock
              </div>
              <div className="flex items-center gap-3 glass rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-all font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-all font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl glass border border-white/20 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <HiOutlineShoppingCart className="w-5 h-5" />
                {isUploading ? 'Saving...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-50"
              >
                <HiLightningBolt className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            {/* Delivery check */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <HiTruck className="w-5 h-5 text-primary-400" />
                <span className="font-semibold text-white text-sm">Check Delivery</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter pincode"
                  className="flex-1 px-3 py-2 glass rounded-xl text-white placeholder:text-white/30 text-sm border border-white/10 focus:border-primary-500 focus:outline-none"
                />
                <button
                  onClick={handleCheckDelivery}
                  className="px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Check
                </button>
              </div>
              {deliveryInfo && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-green-400 text-sm flex items-center gap-2">
                  <HiCheck className="w-4 h-4" />
                  Delivery in {deliveryInfo.days} • {deliveryInfo.free ? 'Free Shipping' : 'Paid Shipping'}
                </motion.div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '✨', label: 'Premium Acrylic' },
                { icon: '🎨', label: 'Vivid Colors' },
                { icon: '📦', label: 'Safe Packaging' },
                { icon: '⭐', label: '5★ Quality' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 glass rounded-xl p-3 text-sm text-white/70">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-semibold text-white mb-4">FAQ</h3>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, i) => (
                  <details key={i} className="glass rounded-xl border border-white/5 group">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-white/80 hover:text-white flex items-center justify-between list-none">
                      {item.q}
                      <span className="text-white/40 group-open:rotate-180 transition-transform text-xs">▾</span>
                    </summary>
                    <div className="px-4 pb-3 text-sm text-white/50 leading-relaxed">{item.a}</div>
                  </details>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
