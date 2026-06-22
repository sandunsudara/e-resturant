import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function CategoryNavSkeleton() {
  return (
    <Stack direction="row" spacing={1.25} sx={{ overflow: 'hidden', py: 1 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
            display: 'flex',
            gap: 1,
            px: 1.25,
            py: 0.75,
            minWidth: 132
          }}
        >
          <Skeleton height={24} variant="circular" width={24} />
          <Skeleton height={18} variant="text" width={76} />
        </Box>
      ))}
    </Stack>
  );
}
