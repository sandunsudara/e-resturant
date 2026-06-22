import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';

import { selectCategories, selectCategoriesLoading, selectSelectedCategoryId, setSelectedCategoryId } from 'features/shop/shopSlice';
import CategoryNavSkeleton from './CategoryNavSkeleton';

function CategoryIcon({ category }) {
  if (category.icon) {
    return <Avatar alt={category.name} src={category.icon} sx={{ height: 24, width: 24 }} />;
  }

  return (
    <Avatar sx={{ bgcolor: 'transparent', color: 'text.secondary', height: 24, width: 24 }}>
      <CategoryRoundedIcon fontSize="small" />
    </Avatar>
  );
}

export default function CategoryNav() {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectCategoriesLoading);
  const selectedCategoryId = useSelector(selectSelectedCategoryId);
  const navItems = [{ id: 'all', name: 'All', icon: '' }, ...categories.filter((category) => category.homeStatus !== false)];

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 70,
        zIndex: (theme) => theme.zIndex.appBar - 1
      }}
    >
      <Container maxWidth="lg" sx={{ overflowX: 'auto', py: 1 }}>
        {loading ? (
          <CategoryNavSkeleton />
        ) : (
          <Box sx={{ display: 'flex', gap: 1.25, minWidth: 'max-content' }}>
            {navItems.map((category) => {
              const active = String(selectedCategoryId) === String(category.id);

              return (
                <ButtonBase
                  key={category.id}
                  aria-pressed={active}
                  onClick={() => dispatch(setSelectedCategoryId(category.id))}
                  sx={{
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: active ? 'divider' : 'transparent',
                    borderRadius: 999,
                    boxShadow: active ? '0 1px 4px rgba(18, 25, 38, 0.12)' : 'none',
                    color: active ? 'text.primary' : 'text.secondary',
                    display: 'inline-flex',
                    gap: 1,
                    minHeight: 42,
                    px: 1.5,
                    py: 0.75,
                    transition: 'background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      borderColor: 'divider'
                    }
                  }}
                >
                  <CategoryIcon category={category} />
                  <Typography sx={{ fontWeight: active ? 700 : 600 }} variant="body2">
                    {category.name}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
