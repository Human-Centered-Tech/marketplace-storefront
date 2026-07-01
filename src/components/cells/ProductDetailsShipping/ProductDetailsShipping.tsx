import { ProductPageAccordion } from '@/components/molecules';

export const ProductDetailsShipping = () => {
  return (
    <ProductPageAccordion
      heading='Shipping'
      defaultOpen={false}
    >
      <div className='product-details'>
        <ul>
          <li>
            Shipping is included on all orders within the
            continental U.S. — there is no separate shipping
            charge at checkout.
          </li>
          <li>
            Ship times vary by item and seller. Message the
            seller if you need a specific delivery timeframe.
          </li>
        </ul>
      </div>
    </ProductPageAccordion>
  );
};
