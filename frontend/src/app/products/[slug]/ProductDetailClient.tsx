"use client";

import { useState } from "react";
import type { FilamentVariantSchema, ProductDetail } from "@/lib/api-types";
import { ImageGallery } from "@/components/product/ImageGallery";
import { FilamentVariants } from "@/components/product/FilamentVariants";
import { AddToCart } from "@/components/product/AddToCart";
import { CompareToggle } from "@/components/product/CompareToggle";

interface Props {
  product: ProductDetail;
}

export function ProductDetailClient({ product }: Props) {
  const [selectedVariant, setSelectedVariant] =
    useState<FilamentVariantSchema | null>(null);

  // When a filament color is selected, swap the displayed image
  const displayImages =
    selectedVariant?.image_url
      ? [
          {
            id: -1,
            url: selectedVariant.image_url,
            alt_text: `${product.name} – ${selectedVariant.color_name}`,
            sort_order: 0,
            is_primary: true,
          },
          ...product.images,
        ]
      : product.images;

  return (
    <div className="flex flex-col lg:flex-row gap-14">
      {/* Image gallery */}
      <ImageGallery images={displayImages} name={product.name} />

      {/* Product info */}
      <div className="flex-1 min-w-0">
        {/* Brand + badges */}
        <div className="flex items-center gap-3 mb-3">
          {product.brand && (
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              {product.brand.name}
            </span>
          )}
          {product.is_featured && (
            <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>

        <h1
          className="font-black text-3xl mb-4 leading-tight"
          style={{ letterSpacing: -1 }}
        >
          {product.name}
        </h1>

        {product.short_desc && (
          <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: 15 }}>
            {product.short_desc}
          </p>
        )}

        {/* Filament variants */}
        {product.product_type === "filament" &&
          product.filament_variants.length > 0 && (
            <div className="mb-6">
              <FilamentVariants
                variants={product.filament_variants}
                onVariantChange={setSelectedVariant}
              />
            </div>
          )}

        {/* Add to cart */}
        <AddToCart product={product} selectedVariant={selectedVariant} />

        {/* Compare (for printers/CNC) */}
        {(product.product_type === "printer" ||
          product.product_type === "cnc") && (
          <div className="flex items-center gap-2 mt-4">
            <CompareToggle productId={product.id} />
            <span className="text-xs text-gray-400">Add to compare</span>
          </div>
        )}

        {/* SKU / weight */}
        {(product.sku || product.weight_grams) && (
          <div className="mt-8 pt-6 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
            {product.sku && (
              <p className="text-xs text-gray-400">SKU: {product.sku}</p>
            )}
            {product.weight_grams && (
              <p className="text-xs text-gray-400">
                Weight: {product.weight_grams}g
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
