import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function ShopItemCardSkeleton() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Skeleton sx={{ aspectRatio: '4 / 3', height: 'auto', transform: 'none' }} variant="rectangular" />
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Skeleton height={28} variant="text" width="58%" />
          <Skeleton height={28} variant="text" width={72} />
        </Stack>
        <Skeleton height={18} sx={{ mt: 1 }} variant="text" width="92%" />
        <Skeleton height={18} variant="text" width="66%" />
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Skeleton height={38} sx={{ borderRadius: 1, transform: 'none', width: '100%' }} variant="rectangular" />
      </CardActions>
    </Card>
  );
}
