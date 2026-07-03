import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';

import { formatCurrency } from 'utils/formatters';

export default function AddonsSelector({ addons = [], selectedAddonIds = [], onToggleAddon, currency = 'LKR' }) {
  const theme = useTheme();

  if (!addons || addons.length === 0) return null;

  return (
    <Box sx={{ mt: 2.5 }}>
      <Typography sx={{ mb: 1.5, fontWeight: 600 }} variant="h4">
        Customize with Addons
      </Typography>
      <Stack spacing={1}>
        {addons.map((addon) => {
          const selected = selectedAddonIds.includes(addon.id);
          const disabled = addon.raw?.status === 0 || addon.raw?.is_deleted === true;

          return (
            <ButtonBase
              key={addon.id}
              disabled={disabled}
              onClick={() => onToggleAddon(addon)}
              sx={{
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                borderRadius: 1.25,
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: '40px 1fr auto',
                alignItems: 'center',
                p: 1.25,
                textAlign: 'left',
                width: '100%',
                opacity: disabled ? 0.5 : 1,
                bgcolor: selected ? 'hsl(210, 100%, 98%)' : 'background.paper',
                transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow']),
                '&:hover': {
                  bgcolor: selected ? 'hsl(210, 100%, 96%)' : 'action.hover',
                  borderColor: selected ? 'primary.main' : 'grey.400'
                }
              }}
            >
              <Checkbox
                checked={selected}
                disabled={disabled}
                color="primary"
                sx={{ p: 0.5 }}
                disableRipple
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {addon.name}
                </Typography>
                {addon.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {addon.description}
                  </Typography>
                )}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                +{formatCurrency(addon.price, addon.currency || currency)}
              </Typography>
            </ButtonBase>
          );
        })}
      </Stack>
    </Box>
  );
}
