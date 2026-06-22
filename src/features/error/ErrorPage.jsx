import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { PagePathEnum } from '../../constants/enum';
import { useEffect, useState } from 'react';
import PageLoader from '../../components/PageLoader/PageLoader';
import ErrorImg from '../../assets/images/404.png';
import ShopService from '../../services/ShopService';
import { getImageUrl } from '../../utils/assets';

const defaultPageContent = {
  title_1: 'Oops...',
  title_2: '404',
  title_3: 'Not Found',
  image: null
};

const ErrorPage = () => {
  const theme = useTheme();
  const [pageContent, setPageContent] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchPageContent = async () => {
    try {
      const response = await ShopService.getPageContent({
        slug: PagePathEnum.ERROR
      });
      if (response?.components) {
        const main = response.components.find((c) => c.type === 'Main');
        const image = response.components.find((c) => c.type === 'Image');
        setPageContent({
          title_1: main?.props?.title_1,
          title_2: main?.props?.title_2,
          title_3: main?.props?.title_3,
          image: image?.props?.image
        });
      } else {
        setPageContent(defaultPageContent);
      }
    } catch {
      setPageContent(defaultPageContent);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent();
  }, []);

  if (pageLoading) return <PageLoader />;

  return (
    <Box display="flex" alignItems="center" flexDirection="column" width="100vw" height="100vh" sx={{ overflow: 'hidden', mt: 5 }}>
      <Typography
        sx={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {' '}
        {pageContent?.title_1}
      </Typography>
      <Typography
        sx={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: theme.palette.primary.main
        }}
      >
        {pageContent?.title_2}
      </Typography>
      <Typography
        sx={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {pageContent?.title_3}
      </Typography>
      <Box
        width={'40%'}
        component="img"
        src={pageContent?.image ? getImageUrl({ imageName: pageContent.image, type: 'logo' }) : ErrorImg}
        alt="Logo"
      />
    </Box>
  );
};

export default ErrorPage;
