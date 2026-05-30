'use client';

import { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineHeart, HiHeart, HiStar, HiOutlineShoppingCart,
  HiLightningBolt, HiCheck, HiTruck, HiPlus, HiX,
} from 'react-icons/hi';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { MdTextFields } from 'react-icons/md';
import { toggleWishlist, selectIsWishlisted } from '@/store/slices/wishlistSlice';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import KonvaEditor from '@/components/editor/KonvaEditor';
import TextLayerEditor from '@/components/editor/TextLayerEditor';
import Link from 'next/link';
import ImageControlPanel from '@/components/editor/ImageControlPanel';
import BorderColorPanel from '@/components/editor/BorderColorPanel';
import { ProductCard } from '@/components/products/ProductGrid';
import {
  selectLayers, selectTextLayers, selectSelectedLayerId,
  addTextLayer, setSelectedLayer,
} from '@/store/slices/editorSlice';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

// Derive unique sizes and thicknesses from variants
function deriveVariantDimensions(variants) {
  const sizes = [];
  const thicknesses = [];
  const seenSizes = new Set();
  const seenThick = new Set();

  for (const v of variants) {
    const dim = v.dim || v.size || v.name;
    const thick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
    if (dim && !seenSizes.has(dim)) { sizes.push(dim); seenSizes.add(dim); }
    if (thick && !seenThick.has(thick)) { thicknesses.push(thick); seenThick.add(thick); }
  }

  return { sizes, thicknesses };
}

const parseVariantPrice = (variant) => {
  if (!variant) return 0;
  return variant.discountprice != null ? Number(variant.discountprice) : Number(variant.price || 0);
};

const formatVariantDim = (variant) => variant?.dim || variant?.size || variant?.name || 'Standard';

const EDITOR_TABS = [
  { id: 'photos', label: 'Photos', emoji: '' },
  { id: 'text', label: 'Text', emoji: '' },
  { id: 'borders', label: 'Borders', emoji: '' },
];

function ProductModel({ imageUrl }) {
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[3, 4, 0.2]} />
      <meshStandardMaterial attach="material-0" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-1" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-2" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-3" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.5} metalness={0.1} />
      <meshStandardMaterial attach="material-5" color="#111" roughness={0.9} />
    </mesh>
  );
}

export default function ProductDetailClient({ product }) {
  const dispatch = useDispatch();
  const { addAndOpenCart, isLoggedIn } = useCart();

  const layers = useSelector(selectLayers);
  const textLayers = useSelector(selectTextLayers);
  const selectedLayerId = useSelector(selectSelectedLayerId);

  const template = product?.template?.templateJson || product?.template;
  const hasVariants = product?.variants && product.variants.length > 0;

  // ── Variant state ───────────────────────────────────────────────────────────
  const { sizes, thicknesses } = useMemo(
    () => (hasVariants ? deriveVariantDimensions(product.variants) : { sizes: [], thicknesses: [] }),
    [product.variants, hasVariants],
  );
  const hasIndependentDims = sizes.length > 0 && thicknesses.length > 0;

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedThickness, setSelectedThickness] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(
    hasVariants ? product.variants[0] : null,
  );

  useEffect(() => {
    if (!hasVariants) return;
    if (sizes.length > 0 && selectedSize == null) {
      setSelectedSize(sizes[0]);
    }
    if (thicknesses.length > 0 && selectedThickness == null) {
      setSelectedThickness(thicknesses[0]);
    }
  }, [hasVariants, sizes, thicknesses, selectedSize, selectedThickness]);

  const findMatchingVariant = (size, thick) => {
    if (!hasVariants) return null;
    const normalizedSize = size || null;
    const normalizedThick = thick != null ? String(thick) : null;
    return product.variants.find((v) => {
      const variantSize = v.dim || v.size || v.name;
      const variantThick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
      return variantSize === normalizedSize && variantThick === normalizedThick;
    }) || product.variants.find((v) => {
      const variantSize = v.dim || v.size || v.name;
      return variantSize === normalizedSize;
    }) || product.variants.find((v) => {
      const variantThick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
      return variantThick === normalizedThick;
    }) || product.variants[0];
  };

  const matchedVariant = useMemo(() => {
    if (!hasVariants) return null;
    if (hasIndependentDims) {
      return findMatchingVariant(selectedSize, selectedThickness);
    }
    return selectedVariant;
  }, [hasVariants, hasIndependentDims, product.variants, selectedSize, selectedThickness, selectedVariant]);

  const availableThicknessesForSize = useCallback(
    (size) => product.variants
      .filter((v) => (v.dim || v.size || v.name) === size)
      .map((v) => (v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null)))
      .filter(Boolean),
    [product.variants],
  );

  const availableSizesForThickness = useCallback(
    (thick) => product.variants
      .filter((v) => {
        const variantThick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
        return variantThick === thick;
      })
      .map((v) => v.dim || v.size || v.name)
      .filter(Boolean),
    [product.variants],
  );

  const handleSelectSize = (size) => {
    const validThicknesses = availableThicknessesForSize(size);
    setSelectedSize(size);
    if (selectedThickness && !validThicknesses.includes(String(selectedThickness))) {
      setSelectedThickness(validThicknesses[0] || null);
    }
  };

  const handleSelectThickness = (thick) => {
    const validSizes = availableSizesForThickness(thick);
    setSelectedThickness(thick);
    if (selectedSize && !validSizes.includes(selectedSize)) {
      setSelectedSize(validSizes[0] || null);
    }
  };

  // ── Pricing ─────────────────────────────────────────────────────────────────
  const fallbackVariantPrice = product.variants?.length
    ? Math.min(...product.variants.map((variant) => parseVariantPrice(variant)))
    : 0;
  const variantPrice = matchedVariant ? parseVariantPrice(matchedVariant) : fallbackVariantPrice;
  const totalPrice = variantPrice;
  const originalPrice = matchedVariant ? Number(matchedVariant.price || 0) : fallbackVariantPrice;
  const discount = getDiscountPercentage(originalPrice, totalPrice);
  const selectedVariantStock = matchedVariant ? Number(matchedVariant.stocks ?? matchedVariant.stock ?? 0) : 0;

  // ── Editor state ────────────────────────────────────────────────────────────
  const [editorTab, setEditorTab] = useState('photos');
  const [quantity, setQuantity] = useState(1);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [triggerExport, setTriggerExport] = useState(false);
  const [cartActionData, setCartActionData] = useState(null);
  const [customRequirements, setCustomRequirements] = useState('');
  
  // ── New Features State ───────────────────────────────────────────────────────
  const [hasStuds, setHasStuds] = useState(false);
  const [addFrame, setAddFrame] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  const FRAME_PREVIEWS = [
    'istockphoto-104714504-612x612.jpg',
    'istockphoto-1168145414-612x612.jpg',
    'istockphoto-1169177826-612x612.jpg',
    'istockphoto-1216917979-612x612.jpg',
    'istockphoto-1333967669-612x612.jpg',
    'istockphoto-1333967698-612x612.jpg',
    'istockphoto-140459568-612x612.jpg',
    'istockphoto-1619037808-612x612.jpg',
  ];

  // ── Derived editor selections ────────────────────────────────────────────────
  const selectedImageLayer = layers.find((l) => l.id === selectedLayerId && l.imageUrl);
  const selectedTextLayer = textLayers.find((t) => t.id === selectedLayerId);
  const isWishlisted = useSelector(selectIsWishlisted(product.id));

  // Shape elements that can have border color overrides
  const shapeElements = useMemo(() => {
    if (!template?.elements) return [];
    return template.elements.filter((el) => ['shape', 'frame', 'background'].includes(el.type));
  }, [template]);

  // ── Cart / Buy handlers ──────────────────────────────────────────────────────
  const handleToggleWishlist = () => {
    dispatch(toggleWishlist(product.id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error('Please login or create an account to add items to cart');
      window.location.href = '/auth/login';
      return;
    }
    if (hasVariants && !matchedVariant) {
      toast.error('Please select an option');
      return;
    }
    setCartActionData('cart');
    setTriggerExport(true);
    setIsUploading(true);
    toast.loading('Preparing high-res design...', { id: 'upload-toast' });
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error('Please login or create an account to proceed');
      window.location.href = '/auth/login';
      return;
    }
    if (hasVariants && !matchedVariant) {
      toast.error('Please select an option');
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
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
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

    let finalDesignId = `design_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const designRes = await fetch('/api/designs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: product.templateId,
          productId: product.id,
          customizedJson: { layers, textLayers },
          previewImage: finalImageUrl,
          name: `${product.name} Custom Design`,
        }),
      });
      if (designRes.ok) {
        const designData = await designRes.json();
        finalDesignId = designData.design.id;
      }
    } catch (e) {
      console.error('Failed to save design to DB:', e);
    }

    await addAndOpenCart({
      productId: product.id,
      designId: finalDesignId,
      name: product.name,
      size: matchedVariant ? (matchedVariant.size || matchedVariant.name) : (selectedSize || 'Standard'),
      thickness: matchedVariant?.thickness || selectedThickness,
      price: totalPrice,
      quantity,
      customData: {
        previewDataUrl: finalImageUrl,
        price: totalPrice,
        customRequirements: customRequirements.trim(),
        hasStuds,
        selectedFrame: addFrame ? selectedFrame : null,
      },
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

  const handleAddTextLayer = () => {
    const id = `text-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    dispatch(addTextLayer({
      id,
      text: 'Your Text',
      x: (template?.canvas?.width ?? 800) / 2 - 80,
      y: (template?.canvas?.height ?? 600) / 2 - 25,
      fontSize: 72,
      fontFamily: 'Inter',
      fontStyle: 'normal',
      color: '#ffffff',
      rotation: 0,
    }));
    dispatch(setSelectedLayer(id));
    setEditorTab('text');
  };

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

          {/* ── LEFT: Editor + Control Panels ─────────────────────────────── */}
          <div className="lg:sticky lg:top-24 space-y-4">
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

            {/* {product?.is3dEnabled && (
              <div className="glass rounded-3xl border border-white/10 p-4 text-sm text-white/80">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">3D View Available</p>
                    <p className="text-xs text-white/50">
                      Explore your customized product in 3D.
                    </p>
                  </div>
                  <button
                    onClick={() => setIs3DModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    View 3D
                  </button>
                </div>
              </div>
            )} */}

            {/* ── Customization Tab Panel ──────────────────────────────────── */}
            {template && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass rounded border border-white/5 overflow-hidden"
              >
                {/* Tab headers */}
                <div className="flex border-b border-white/10">
                  {EDITOR_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setEditorTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
                        editorTab === tab.id
                          ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5'
                          : 'text-white/50 hover:text-white/80 border-b-2 border-transparent'
                      }`}
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.label}</span>
                      {tab.id === 'text' && textLayers.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500/30 text-primary-300 rounded-full">
                          {textLayers.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-4 min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {/* Photos Tab */}
                    {editorTab === 'photos' && (
                      <motion.div
                        key="photos"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ImageControlPanel layer={selectedImageLayer} />
                      </motion.div>
                    )}

                    {/* Text Tab */}
                    {editorTab === 'text' && (
                      <motion.div
                        key="text"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <button
                          onClick={handleAddTextLayer}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all"
                        >
                          <HiPlus className="w-4 h-4" />
                          Add Text Layer
                        </button>

                        {textLayers.length > 0 && (
                          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {textLayers.map((tl) => (
                              <button
                                key={tl.id}
                                onClick={() => dispatch(setSelectedLayer(tl.id))}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center gap-2 ${
                                  selectedLayerId === tl.id
                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                                    : 'glass text-white/70 hover:text-white'
                                }`}
                              >
                                <MdTextFields className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{tl.text || 'Empty text'}</span>
                                <span className="ml-auto text-xs text-white/30 flex-shrink-0">{tl.fontFamily}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Text layer editor */}
                        {textLayers.length > 0 && (
                          <div className="border-t border-white/10 pt-4">
                            <TextLayerEditor textLayer={selectedTextLayer} />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Borders Tab */}
                    {editorTab === 'borders' && (
                      <motion.div
                        key="borders"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <BorderColorPanel shapeElements={shapeElements} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── RIGHT: Product Info ──────────────────────────────────────────── */}
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
                  {[...Array(5)].map((_, i) => (
                    <HiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white/50 text-sm">4.9 (2.3k reviews)</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                {product.shortDescription || 'Premium custom acrylic print crafted with museum-quality precision.'}
              </p>
            </div>

            {/* Price */}
            <div className="glass rounded p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">{formatPrice(totalPrice)}</span>
                {originalPrice > totalPrice && (
                  <span className="text-xl text-white/40 line-through">{formatPrice(originalPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm font-bold">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs mt-1">Inclusive of all taxes • Free shipping above ₹499</p>
            </div>

            {/* ── Variant Selection: Independent Size + Thickness ─────────── */}
            {hasVariants && hasIndependentDims && (
              <div className="space-y-4">
                {sizes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm flex items-center gap-2">
                      Size
                      {selectedSize && (
                        <span className="text-white/40 font-normal">— {selectedSize}</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const available = !selectedThickness
                          ? product.variants.some((v) => (v.dim || v.size || v.name) === size)
                          : product.variants.some((v) => {
                              const variantSize = v.dim || v.size || v.name;
                              const variantThick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
                              return variantSize === size && variantThick === selectedThickness;
                            });
                        return (
                          <button
                            key={size}
                            onClick={() => handleSelectSize(size)}
                            disabled={!available}
                            className={`px-4 py-2 rounded text-sm font-medium transition-all border ${
                              selectedSize === size
                                ? 'gradient-primary border-primary-500 text-white glow'
                                : available
                                ? 'border-white/15 text-white/60 hover:border-white/40 hover:text-white glass'
                                : 'border-white/5 text-white/20 cursor-not-allowed line-through'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {thicknesses.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm flex items-center gap-2">
                      Thickness
                      {selectedThickness && (
                        <span className="text-white/40 font-normal">— {selectedThickness}</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {thicknesses.map((thick) => {
                        const available = !selectedSize
                          ? product.variants.some((v) => {
                              const variantThick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
                              return variantThick === thick;
                            })
                          : product.variants.some((v) => {
                              const variantSize = v.dim || v.size || v.name;
                              const variantThick = v.thick != null ? String(v.thick) : (v.thickness != null ? String(v.thickness) : null);
                              return variantThick === thick && variantSize === selectedSize;
                            });
                        return (
                          <button
                            key={thick}
                            onClick={() => handleSelectThickness(thick)}
                            disabled={!available}
                            className={`px-4 py-2 rounded text-sm font-medium transition-all border ${
                              selectedThickness === thick
                                ? 'gradient-primary border-primary-500 text-white glow'
                                : available
                                ? 'border-white/15 text-white/60 hover:border-white/40 hover:text-white glass'
                                : 'border-white/5 text-white/20 cursor-not-allowed line-through'
                            }`}
                          >
                            {thick}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Matched variant info */}
                {matchedVariant && (
                  <div className="flex items-center gap-2 text-xs text-white/40 px-1">
                    <HiCheck className="w-3.5 h-3.5 text-green-400" />
                    <span>
                      {formatVariantDim(matchedVariant)} / {matchedVariant.thick || matchedVariant.thickness} — {formatPrice(parseVariantPrice(matchedVariant))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Flat variant list (fallback when no size/thickness fields) */}
            {hasVariants && !hasIndependentDims && (
              <div>
                <h3 className="font-semibold text-white mb-3">
                  Select Option
                  {selectedVariant && (
                    <span className="text-white/50 text-sm font-normal ml-2">— {selectedVariant.name}</span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2.5 rounded text-sm font-medium transition-all border flex flex-col items-start ${
                        selectedVariant?.id === variant.id
                          ? 'gradient-primary border-primary-500 text-white glow'
                          : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white glass'
                      }`}
                    >
                      <span>{variant.name}</span>
                      <span className="text-xs opacity-70 mt-1">{formatPrice(variant.discountPrice || variant.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock & Quantity */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 text-sm ${selectedVariantStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                <HiCheck className="w-4 h-4" /> {selectedVariantStock > 0 ? `In Stock (${selectedVariantStock})` : 'Out of Stock'}
              </div>
              <div className="flex items-center gap-3 glass rounded p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-all font-bold"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-white">{quantity}</span>
                <button
                  onClick={() => {
                    if (selectedVariantStock > 0) {
                      setQuantity((current) => Math.min(current + 1, selectedVariantStock));
                    }
                  }}
                  className="w-9 h-9 rounded-lg hover:bg-white/10 text-white flex items-center justify-center transition-all font-bold"
                  disabled={selectedVariantStock === 0}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleToggleWishlist}
                disabled={isUploading}
                className={`flex-1 flex items-center justify-center gap-1 rounded border text-white font-bold transition-all ${isWishlisted ? 'bg-white/10 border-primary-500 text-primary-300' : 'glass border-white/20 hover:bg-white/10 hover:text-white'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <HiOutlineHeart className={`w-5 h-5 ${isWishlisted ? 'text-red-400' : 'text-white/70'}`} />
                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded glass border border-white/20 text-white font-bold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <HiOutlineShoppingCart className="w-5 h-5" />
                {isUploading ? 'Saving...' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded gradient-primary text-white font-bold hover:opacity-90 transition-all glow disabled:opacity-50"
              >
                <HiLightningBolt className="w-5 h-5" />
                Buy Now
              </button>
            </div>

            {/* Delivery check */}
            <div className="glass rounded p-4">
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
                  className="flex-1 px-3 py-2 glass rounded text-white placeholder:text-white/30 text-sm border border-white/10 focus:border-primary-500 focus:outline-none"
                />
                <button
                  onClick={handleCheckDelivery}
                  className="px-4 py-2 rounded gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Check
                </button>
              </div>
              {deliveryInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-green-400 text-sm flex items-center gap-2"
                >
                  <HiCheck className="w-4 h-4" />
                  Delivery in {deliveryInfo.days} • {deliveryInfo.free ? 'Free Shipping' : 'Paid Shipping'}
                </motion.div>
              )}
            </div>

            {/* Custom Requirements */}
            <div className="glass rounded p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <span className="font-semibold text-white text-sm">Custom Instructions</span>
                  <span className="ml-2 text-xs text-white/30">(optional)</span>
                </div>
              </div>
              <textarea
                value={customRequirements}
                onChange={(e) => setCustomRequirements(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="E.g. Please use matte finish, keep the text centered, add a birthday message in gold..."
                className="w-full bg-black/20 border border-white/10 rounded p-3 text-white text-sm resize-none focus:outline-none focus:border-primary-500 transition-colors placeholder:text-white/25"
              />
              <div className="text-right text-xs text-white/20">{customRequirements.length}/500</div>
            </div>

            {/* Custom Add-ons: Studs & Frames */}
            <div className="glass rounded p-4 space-y-4">
              <h3 className="font-semibold text-white text-sm border-b border-white/10 pb-2">Optional Add-ons</h3>
              
              {/* Studs */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${hasStuds ? 'bg-primary-500 border-primary-500' : 'border-white/20 group-hover:border-white/40'}`}>
                  {hasStuds && <HiCheck className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Add Studs</div>
                  <div className="text-xs text-white/40">Includes mounting studs for a premium look</div>
                </div>
                <input type="checkbox" checked={hasStuds} onChange={(e) => setHasStuds(e.target.checked)} className="hidden" />
              </label>

              {/* Frames */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 shrink-0 rounded border flex items-center justify-center transition-colors ${addFrame ? 'bg-primary-500 border-primary-500' : 'border-white/20 group-hover:border-white/40'}`}>
                    {addFrame && <HiCheck className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Add Frame</div>
                    <div className="text-xs text-white/40">Select a frame for your product</div>
                  </div>
                  <input type="checkbox" checked={addFrame} onChange={(e) => {
                    setAddFrame(e.target.checked);
                    if (e.target.checked && !selectedFrame) setSelectedFrame(FRAME_PREVIEWS[0]);
                  }} className="hidden" />
                </label>

                {addFrame && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-1 overflow-x-auto custom-scrollbar">
                      {FRAME_PREVIEWS.map(frame => (
                        <button
                          key={frame}
                          onClick={() => setSelectedFrame(frame)}
                          className={`relative flex-shrink-0 snap-start w-20 h-20 rounded overflow-hidden border-2 transition-all ${selectedFrame === frame ? 'border-primary-500 scale-105' : 'border-transparent hover:border-white/20'}`}
                        >
                          <img src={`/frames/${frame}`} alt="Frame preview" className="w-full h-full object-cover" />
                          {selectedFrame === frame && (
                            <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                              <HiCheck className="w-6 h-6 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      ))}
                      <Link
                        href="/frames"
                        className="flex-shrink-0 snap-start w-20 h-20 rounded border-2 border-white/10 hover:border-white/30 border-dashed flex flex-col items-center justify-center gap-1 text-white/50 hover:text-white transition-all bg-white/5"
                      >
                        <span className="text-lg">🖼️</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-center leading-tight">View<br/>All 32</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '✨', label: 'Premium Acrylic' },
                { icon: '🎨', label: 'Vivid Colors' },
                { icon: '📦', label: 'Safe Packaging' },
                { icon: '⭐', label: '5★ Quality' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 glass rounded p-3 text-sm text-white/70">
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
                  <details key={i} className="glass rounded border border-white/5 group">
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
        
        {/* ── Similar Products Section ─────────────────────────────── */}
        {product.similarProducts && product.similarProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
              <span className="text-primary-400">✧</span> You might also like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.similarProducts.map((similar, idx) => (
                <ProductCard key={similar.id} product={similar} index={idx} showSecondary={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3D Preview Modal */}
      <AnimatePresence>
        {is3DModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-4xl bg-dark-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                <div className="flex gap-2 p-1 glass rounded-xl">
                  <span className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary-500 text-white shadow-md">
                    3D View
                  </span>
                </div>
                <button
                  onClick={() => setIs3DModalOpen(false)}
                  className="p-2 glass rounded-full text-white/50 hover:text-white transition-all hover:bg-white/10"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Viewer Area */}
              <div className="flex-1 relative bg-black/40 overflow-hidden flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 cursor-move"
                >
                  <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                    <directionalLight position={[-5, 5, -5]} intensity={0.2} />
                    
                    <Suspense fallback={null}>
                      {(previewDataUrl || product?.images?.[0]) && (
                        <ProductModel imageUrl={previewDataUrl || product.images[0]} />
                      )}
                    </Suspense>
                    
                    <OrbitControls 
                      enablePan={false}
                      minDistance={4}
                      maxDistance={12}
                      autoRotate={true}
                      autoRotateSpeed={2}
                    />
                  </Canvas>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-xs text-white/50 flex items-center gap-2">
                    <span>🖱️</span> Drag to rotate · Scroll to zoom
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
