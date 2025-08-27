import { Metadata } from 'next';
import ImageGenerateDemo from './image-generate-demo';

export const metadata: Metadata = {
  title: 'Image Generate Demo | VV Ship',
  description: 'Demonstration of the reusable Image Generate component with different configurations',
};

export default function ImageGenerateDemoPage() {
  return <ImageGenerateDemo />;
}