import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

import { formatCurrency } from 'utils/formatters';

const DEFAULT_CURRENCY = 'LKR';

function buildCartItem(product, combination) {
  return {
    ...product,
    id: `${product.id}:${combination.variationId || combination.id}`,
    productId: product.productId || product.id,
    variationId: combination.variationId || combination.id || 0,
    variationLabel: combination.label,
    price: combination.price,
    currency: combination.currency || product.currency,
    image: combination.image || product.image,
    selectedCombination: combination.raw || combination
  };
}

export default function ShopItemCombinationModal({ currency = DEFAULT_CURRENCY, onAddItem, onClose, open, product }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const combinations = useMemo(() => product?.combinations || [], [product]);
  const [selectedCombinationId, setSelectedCombinationId] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedCombinationId('');
    }
  }, [open, product?.id]);

  const selectedCombination = combinations.find((combination) => String(combination.id) === selectedCombinationId);
  const displayImage = selectedCombination?.image || product?.image;
  const displayPrice = selectedCombination?.price ?? product?.price ?? 0;
  const displayCurrency = selectedCombination?.currency || product?.currency || currency;

  const handleAddItem = () => {
    if (!product || !selectedCombination) return;

    onAddItem(buildCartItem(product, selectedCombination));
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap variant="h3">
              {product?.name || 'Product'}
            </Typography>
            <Typography color="primary.main" variant="h4">
              {formatCurrency(displayPrice, displayCurrency)}
            </Typography>
          </Box>
          <Tooltip title="Close">
            <IconButton aria-label="Close product options" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 0.9fr) minmax(0, 1.1fr)' }
          }}
        >
          {displayImage ? (
            <Box
              alt={product?.name}
              component="img"
              src={displayImage}
              sx={{
                aspectRatio: '4 / 3',
                bgcolor: 'grey.100',
                borderRadius: 1,
                objectFit: 'cover',
                width: '100%'
              }}
            />
          ) : (
            <Box
              sx={{
                alignItems: 'center',
                aspectRatio: '4 / 3',
                bgcolor: 'grey.100',
                borderRadius: 1,
                color: 'text.secondary',
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <Typography variant="h1">{product?.name?.charAt(0).toUpperCase()}</Typography>
            </Box>
          )}

          <Stack spacing={2.25}>
            {product?.description ? (
              <Typography color="text.secondary" variant="body2">
                {product.description}
              </Typography>
            ) : null}

            <Box>
              <Typography sx={{ mb: 1.25 }} variant="h4">
                Select option
              </Typography>
              <Stack spacing={1}>
                {combinations.map((combination) => {
                  const selected = String(combination.id) === selectedCombinationId;
                  const disabled = combination.available === false;

                  return (
                    <ButtonBase
                      aria-pressed={selected}
                      disabled={disabled}
                      key={combination.id}
                      onClick={() => setSelectedCombinationId(String(combination.id))}
                      sx={{
                        border: '1px solid',
                        borderColor: selected ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        display: 'grid',
                        gap: 1.5,
                        gridTemplateColumns: '56px 1fr auto',
                        opacity: disabled ? 0.55 : 1,
                        p: 1,
                        textAlign: 'left',
                        transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
                        width: '100%',
                        ...(selected && {
                          bgcolor: 'primary.light',
                          boxShadow: 1
                        }),
                        '&:hover': {
                          bgcolor: disabled ? 'transparent' : 'action.hover',
                          borderColor: disabled ? 'divider' : 'primary.main'
                        }
                      }}
                    >
                      {combination.image ? (
                        <Box
                          alt={combination.label}
                          component="img"
                          src={combination.image}
                          sx={{
                            aspectRatio: '1',
                            bgcolor: 'grey.100',
                            borderRadius: 1,
                            objectFit: 'cover',
                            width: 56
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            alignItems: 'center',
                            aspectRatio: '1',
                            bgcolor: selected ? 'primary.main' : 'grey.100',
                            borderRadius: 1,
                            color: selected ? 'primary.contrastText' : 'text.secondary',
                            display: 'flex',
                            justifyContent: 'center',
                            width: 56
                          }}
                        >
                          <Typography variant="subtitle1">{combination.label.charAt(0).toUpperCase()}</Typography>
                        </Box>
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap variant="subtitle1">
                          {combination.label}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {disabled ? 'Out of stock' : combination.stockLabel}
                        </Typography>
                      </Box>
                      <Typography color="primary.main" variant="subtitle1" whiteSpace="nowrap">
                        {formatCurrency(combination.price, combination.currency || displayCurrency)}
                      </Typography>
                    </ButtonBase>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
        <Button color="inherit" onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button disabled={!selectedCombination} onClick={handleAddItem} startIcon={<AddShoppingCartIcon />} variant="contained">
          Add to cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
