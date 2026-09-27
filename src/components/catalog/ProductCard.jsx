import { Link } from 'react-router-dom';
import ProjectImage from '../media/ProjectImage';
import { formatCurrency } from '../../utils/helpers';
import { placeholderImage } from '../../data/placeholderImages';

const ProductCard = ({ product, subcategoryName, tone = 0 }) => (
  <Link to={`/producto/${product.id}`} className="group block">
    <div className="overflow-hidden rounded-2xl">
      <ProjectImage
        src={product.images?.[0] ?? placeholderImage(product.id, 800, 1000)}
        alt={product.name}
        label={product.name}
        tone={tone}
        className="aspect-[4/5] w-full"
      />
    </div>
    <div className="mt-3">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="mt-0.5 text-sm text-muted">
        {subcategoryName}
        {product.price > 0 && ` · Desde ${formatCurrency(product.price)}`}
      </p>
    </div>
  </Link>
);

export const ProductCardSkeleton = () => (
  <div aria-hidden="true">
    <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-line" />
    <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-line" />
    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-line" />
  </div>
);

export default ProductCard;
