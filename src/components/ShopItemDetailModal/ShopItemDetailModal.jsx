import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ProductService from 'services/ProductService';
import { getImageUrl } from 'utils/assets';
import { formatCurrency } from 'utils/formatters';
import { selectCurrentShop } from 'features/shop/shopSlice';
import { getShopVendorId } from 'utils/shopUtils';
import AddonsSelector from '../AddonsSelector/AddonsSelector';

const DEFAULT_CURRENCY = 'LKR';
const DESCRIPTION_COLLAPSED_HEIGHT = 66;

const getYoutubeId = (url) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[1] && match[1].trim().length === 11) {
    return match[1].trim();
  }
  try {
    const urlObj = new URL(trimmed);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    }
    if (urlObj.pathname.includes('/embed/') || urlObj.pathname.includes('/shorts/')) {
      return urlObj.pathname.split('/').pop();
    }
    const v = urlObj.searchParams.get('v');
    if (v) return v;
  } catch (e) {
    // Ignore URL constructor errors for partial paths
  }
  return null;
};

export default function ShopItemDetailModal({ open, onClose, item, currency = DEFAULT_CURRENCY, onAddItem }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const shop = useSelector(selectCurrentShop);

  const [productData, setProductData] = useState(null);
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [favorited, setFavorited] = useState(false);

  const mediaList = useMemo(() => {
    const list = [];
    if (productData) {
      if (productData.thumbnail) {
        list.push({ type: 'image', url: getImageUrl({ imageName: productData.thumbnail, type: 'brand' }) });
      }
      if (Array.isArray(productData.image)) {
        productData.image.forEach((img) => {
          if (img?.name) {
            const url = getImageUrl({ imageName: img.name, type: 'brand' });
            if (!list.some((existing) => existing.url === url)) {
              list.push({ type: 'image', url });
            }
          }
        });
      }
      if (productData.video_url) {
        list.push({ type: 'video', url: productData.video_url });
      }
    } else if (item?.image) {
      list.push({ type: 'image', url: item.image });
    }
    return list;
  }, [productData, item?.image]);

  useEffect(() => {
    if (!open || !item?.id) {
      setProductData(null);
      setAddons([]);
      setSelectedAddons([]);
      setError(null);
      setActiveMediaIndex(0);
      setQuantity(1);
      setDescriptionExpanded(false);
      setInstructions('');
      return;
    }

    const controller = new AbortController();
    const fetchProductAndAddons = async () => {
      setLoading(true);
      setError(null);
      try {
        const vendorId = shop ? getShopVendorId(shop) : null;
        const [data, addonsData] = await Promise.all([
          ProductService.getProductById(item.id, controller.signal),
          vendorId ? ProductService.getAddons({ vendorId, signal: controller.signal }) : { items: [] }
        ]);
        setProductData(data);
        setAddons(addonsData?.items || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Failed to load product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndAddons();

    return () => {
      controller.abort();
    };
  }, [open, item?.id, shop]);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [mediaList]);

  useEffect(() => {
    if (mediaList.length <= 1 || !open) return undefined;

    const activeMedia = mediaList[activeMediaIndex];
    if (activeMedia?.type === 'video') return undefined;

    const intervalId = setInterval(() => {
      setActiveMediaIndex((current) => (current + 1) % mediaList.length);
    }, 3500);

    return () => clearInterval(intervalId);
  }, [mediaList, open, activeMediaIndex]);

  const handleToggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    );
  };

  if (!item) return null;

  const activeMedia = mediaList[activeMediaIndex];
  const basePrice = productData?.unit_price !== undefined ? productData.unit_price : item.price;
  const selectedAddonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const unitPrice = basePrice + selectedAddonsTotal;
  const totalPrice = unitPrice * quantity;
  const displayName = productData?.name || item.name;
  const effectiveCurrency = item.currency || currency;

  const rating = productData?.rating;
  const isBestSeller = Boolean(productData?.is_best_seller || productData?.best_seller);
  const isPopular = Boolean(productData?.is_popular);
  const prepTime = productData?.preparation_time || productData?.prep_time;
  const spiceLevel = productData?.spice_level;

  const hasHighlights = Boolean(rating || isBestSeller || isPopular || prepTime || spiceLevel);

  const rawDescription = productData?.description || '';
  const hasDescription = rawDescription.trim().length > 0;

  const handleAddToCart = () => {
    const cartItem = {
      ...item,
      price: basePrice,
      quantity,
      specialInstructions: instructions.trim() || undefined,
      selectedAddons,
      cartId: `${item.id}:0:${selectedAddons.map((a) => a.id).sort().join(',')}`
    };
    onAddItem(cartItem);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? '20px 20px 0 0' : 3,
          ...(fullScreen && { position: 'fixed', bottom: 0, m: 0, maxHeight: '92vh' }),
          overflow: 'hidden'
        }
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'background.paper', boxShadow: 1 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography color="error" variant="body1" align="center" sx={{ py: 8 }}>
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              overflowY: 'auto',
              flex: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            {/* Hero media */}
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', bgcolor: 'grey.100' }}>
              {activeMedia ? (
                activeMedia.type === 'image' ? (
                  <Box
                    component="img"
                    src={activeMedia.url}
                    alt={displayName}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : getYoutubeId(activeMedia.url) ? (
                  <Box
                    component="iframe"
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeMedia.url)}`}
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sx={{ width: '100%', height: '100%', border: 'none', bgcolor: 'black' }}
                  />
                ) : (
                  <Box
                    component="video"
                    src={activeMedia.url}
                    controls
                    sx={{ width: '100%', height: '100%', bgcolor: 'black' }}
                  />
                )
              ) : (
                <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.200' }} />
              )}

              {/* Gradient overlay for legibility of controls */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.25) 100%)',
                  pointerEvents: 'none'
                }}
              />

              <IconButton
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'white' }
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <IconButton
                onClick={() => setFavorited((f) => !f)}
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: 12,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'white' }
                }}
                size="small"
              >
                {favorited ? <FavoriteIcon fontSize="small" color="error" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>

              {/* Dot indicators */}
              {mediaList.length > 1 && (
                <Box sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 0.75 }}>
                  {mediaList.map((media, index) => (
                    <Box
                      key={index}
                      onClick={() => setActiveMediaIndex(index)}
                      sx={{
                        width: activeMediaIndex === index ? 18 : 6,
                        height: 6,
                        borderRadius: 3,
                        cursor: 'pointer',
                        bgcolor: activeMediaIndex === index ? 'common.white' : 'rgba(255,255,255,0.55)',
                        transition: 'width 0.2s ease'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Thumbnail row (only meaningful with 2+ media items) */}
            {mediaList.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  px: 2.5,
                  py: 1.25,
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  }
                }}
              >
                {mediaList.map((media, index) => (
                  <Box
                    key={index}
                    onClick={() => setActiveMediaIndex(index)}
                    sx={{
                      flex: '0 0 auto',
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: activeMediaIndex === index ? 'primary.main' : 'transparent',
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {media.type === 'image' ? (
                      <Box component="img" src={media.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        {mediaList[0]?.type === 'image' && (
                          <Box
                            component="img"
                            src={mediaList[0].url}
                            sx={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                          />
                        )}
                        <PlayArrowIcon sx={{ zIndex: 1, color: 'primary.main', fontSize: 26 }} />
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ px: 2.5, pt: mediaList.length > 1 ? 0.5 : 2.5 }}>
              {/* Name, rating, price */}
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                {displayName}
              </Typography>

              {rating ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {Number(rating).toFixed(1)}
                  </Typography>
                </Box>
              ) : null}

              <Typography color="primary.main" variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {formatCurrency(basePrice, effectiveCurrency)}
              </Typography>

              {/* Highlight badges */}
              {hasHighlights && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  {isBestSeller && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 16 }} />}
                      label="Best seller"
                      size="small"
                      sx={{ bgcolor: 'warning.light', fontWeight: 600 }}
                    />
                  )}
                  {isPopular && (
                    <Chip
                      icon={<WhatshotIcon sx={{ fontSize: 16 }} />}
                      label="Popular"
                      size="small"
                      sx={{ bgcolor: 'error.light', color: 'error.contrastText', fontWeight: 600 }}
                    />
                  )}
                  {spiceLevel && (
                    <Chip
                      icon={<LocalFireDepartmentIcon sx={{ fontSize: 16 }} />}
                      label={spiceLevel}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {prepTime && (
                    <Chip
                      icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                      label={typeof prepTime === 'number' ? `${prepTime} min` : prepTime}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}

              {/* Short description */}
              {productData?.short_description && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1.5 }}>
                  {productData.short_description}
                </Typography>
              )}

              {/* Collapsible long description */}
              {hasDescription && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    About
                  </Typography>
                  <Box
                    sx={{
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: 'text.primary',
                      maxHeight: descriptionExpanded ? 'none' : DESCRIPTION_COLLAPSED_HEIGHT,
                      overflow: 'hidden',
                      position: 'relative',
                      '& h3': { fontSize: '1.05rem', mt: 1.5, mb: 0.5, fontWeight: 700 },
                      '& h4': { fontSize: '0.95rem', mt: 1.5, mb: 0.5, fontWeight: 700 },
                      '& p': { mb: 1 },
                      '& ul': { pl: 2.5, mb: 1 },
                      '& li': { mb: 0.25 }
                    }}
                    dangerouslySetInnerHTML={{ __html: rawDescription }}
                  />
                  <Typography
                    variant="body2"
                    onClick={() => setDescriptionExpanded((e) => !e)}
                    sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', mt: 0.5 }}
                  >
                    {descriptionExpanded ? 'Show less' : 'Read more'}
                  </Typography>
                </Box>
              )}

              {/* Addons */}
              {addons.length > 0 && (
                <Box sx={{ mt: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Customize your order
                  </Typography>
                  <AddonsSelector
                    addons={addons}
                    selectedAddonIds={selectedAddons.map((a) => a.id)}
                    onToggleAddon={handleToggleAddon}
                    currency={effectiveCurrency}
                  />
                </Box>
              )}

              {/* Live price breakdown, only once addons are selected */}
              {selectedAddons.length > 0 && (
                <Box sx={{ mt: 2.5, p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Base price
                    </Typography>
                    <Typography variant="body2">{formatCurrency(basePrice, effectiveCurrency)}</Typography>
                  </Box>
                  {selectedAddons.map((addon) => (
                    <Box key={addon.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        + {addon.name}
                      </Typography>
                      <Typography variant="body2">{formatCurrency(addon.price, effectiveCurrency)}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Quantity selector */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2.5, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Quantity
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 3
                  }}
                >
                  <IconButton
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    size="small"
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700 }}>{quantity}</Typography>
                  <IconButton onClick={() => setQuantity((q) => q + 1)} size="small">
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Sticky bottom bar */}
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2.5,
              py: 1.75,
              borderTop: '1px solid',
              borderColor: 'grey.200',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {formatCurrency(totalPrice, effectiveCurrency)}
              </Typography>
            </Box>
            <Button
              onClick={handleAddToCart}
              variant="contained"
              size="large"
              sx={{ flex: 1, py: 1.25, borderRadius: 2.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
            >
              Add to cart
            </Button>
          </Box>
        </>
      )}
    </Dialog>
  );
}