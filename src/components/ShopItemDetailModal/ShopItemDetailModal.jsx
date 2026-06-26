import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import ProductService from 'services/ProductService';
import { getImageUrl } from 'utils/assets';
import { formatCurrency } from 'utils/formatters';

const DEFAULT_CURRENCY = 'LKR';

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

const getProductImageUrls = (data) => {
  if (!data) return [];
  const urls = [];
  if (data.thumbnail) {
    urls.push(getImageUrl({ imageName: data.thumbnail, type: 'brand' }));
  }
  if (Array.isArray(data.image)) {
    data.image.forEach((img) => {
      if (img?.name) {
        const url = getImageUrl({ imageName: img.name, type: 'brand' });
        if (!urls.includes(url)) {
          urls.push(url);
        }
      }
    });
  }
  return urls;
};

export default function ShopItemDetailModal({ open, onClose, item, currency = DEFAULT_CURRENCY, onAddItem }) {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

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
    } else {
      if (item?.image) {
        list.push({ type: 'image', url: item.image });
      }
    }
    return list;
  }, [productData, item?.image]);

  useEffect(() => {
    if (!open || !item?.id) {
      setProductData(null);
      setError(null);
      setActiveMediaIndex(0);
      return;
    }

    const controller = new AbortController();
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ProductService.getProductById(item.id, controller.signal);
        setProductData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Failed to load product details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [open, item?.id]);

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [mediaList]);

  useEffect(() => {
    if (mediaList.length <= 1 || !open) return undefined;

    // Pause autoplay if active media is a video
    const activeMedia = mediaList[activeMediaIndex];
    if (activeMedia?.type === 'video') return undefined;

    const intervalId = setInterval(() => {
      setActiveMediaIndex((current) => (current + 1) % mediaList.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [mediaList, open, activeMediaIndex]);

  if (!item) return null;

  const activeMedia = mediaList[activeMediaIndex];
  const price = productData?.unit_price !== undefined ? productData.unit_price : item.price;
  const displayName = productData?.name || item.name;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {displayName}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography color="error" variant="body1" align="center" sx={{ py: 4 }}>
            {error}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeMedia ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ position: 'relative', width: '100%', maxHeight: 300, aspectRatio: '16 / 9', bgcolor: 'grey.100', borderRadius: 1, overflow: 'hidden' }}>
                  {activeMedia.type === 'image' ? (
                    <Box
                      component="img"
                      src={activeMedia.url}
                      alt={displayName}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : getYoutubeId(activeMedia.url) ? (
                    <Box
                      component="iframe"
                      src={`https://www.youtube.com/embed/${getYoutubeId(activeMedia.url)}`}
                      title="Product Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sx={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        bgcolor: 'black'
                      }}
                    />
                  ) : (
                    <Box
                      component="video"
                      src={activeMedia.url}
                      controls
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: 'black'
                      }}
                    />
                  )}
                </Box>

                {mediaList.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1 }}>
                    {mediaList.map((media, index) => (
                      <Box
                        key={index}
                        onClick={() => setActiveMediaIndex(index)}
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: activeMediaIndex === index ? 'primary.main' : 'transparent',
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            borderColor: activeMediaIndex === index ? 'primary.main' : 'grey.400'
                          }
                        }}
                      >
                        {media.type === 'image' ? (
                          <Box
                            component="img"
                            src={media.url}
                            alt={`${displayName} thumbnail ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <>
                            {mediaList[0]?.type === 'image' && (
                              <Box
                                component="img"
                                src={mediaList[0].url}
                                sx={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.6
                                }}
                              />
                            )}
                            <PlayArrowIcon sx={{ zIndex: 1, color: 'primary.main', fontSize: 32 }} />
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : null}
            <Typography color="primary.main" variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(price, item.currency || currency)}
            </Typography>

            {productData?.short_description && (
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', fontWeight: 'medium' }}>
                {productData.short_description}
              </Typography>
            )}

            {productData?.description && (
              <Box
                sx={{
                  mt: 1,
                  fontSize: '0.925rem',
                  lineHeight: 1.6,
                  color: 'text.primary',
                  '& h3': { fontSize: '1.2rem', mt: 2, mb: 1, fontWeight: 'bold' },
                  '& h4': { fontSize: '1.05rem', mt: 2, mb: 1, fontWeight: 'bold' },
                  '& p': { mb: 1.5 },
                  '& ul': { pl: 3, mb: 1.5 },
                  '& li': { mb: 0.5 }
                }}
                dangerouslySetInnerHTML={{ __html: productData.description }}
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          onClick={() => {
            onAddItem(item);
            onClose();
          }}
          startIcon={<AddShoppingCartIcon />}
          variant="contained"
          disabled={loading}
        >
          Add to cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
