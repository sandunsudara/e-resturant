import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function PageLoader({ label = 'Loading...', minHeight = '100vh' }) {
  return (
    <Box sx={{ display: 'grid', minHeight, placeItems: 'center' }}>
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">{label}</Typography>
      </Stack>
    </Box>
  );
}
