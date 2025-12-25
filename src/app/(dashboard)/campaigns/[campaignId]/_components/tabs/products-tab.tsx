"use client";

import { Loader2, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductGroups, useProducts } from "@/features/campaigns";
import type { ProductPerformance, ProductGroup } from "@/features/campaigns/types";
import { formatCompact, formatCurrency } from "@/shared/lib/format";

interface ProductsTabProps {
  accountId: string;
  campaignId: string;
}

const microsToDollars = (micros: number) => micros / 1_000_000;

function ProductsTable({ products }: { products: ProductPerformance[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Product</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead className="text-right">Impressions</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead className="text-right">Cost</TableHead>
          <TableHead className="text-right">Conversions</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.product_id}>
            <TableCell className="font-medium">
              <div className="max-w-[280px]">
                <p className="truncate">{product.product_title}</p>
                <p className="text-xs text-muted-foreground truncate">{product.product_id}</p>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm">{product.product_brand ?? "-"}</span>
            </TableCell>
            <TableCell className="text-right">{formatCompact(product.impressions)}</TableCell>
            <TableCell className="text-right">{formatCompact(product.clicks)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(microsToDollars(product.cost_micros))}
            </TableCell>
            <TableCell className="text-right">{product.conversions.toFixed(1)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(microsToDollars(product.conversions_value))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ProductGroupsSection({ productGroups }: { productGroups: ProductGroup[] }) {
  return (
    <div className="space-y-3">
      {productGroups.map((group) => (
        <div
          key={group.product_group_id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{group.listing_group_filter}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCompact(group.impressions)} impressions, {formatCompact(group.clicks)} clicks,{" "}
              {group.conversions.toFixed(1)} conversions
            </p>
          </div>
          <Badge variant={group.status === "ENABLED" ? "default" : "secondary"}>
            {group.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export function ProductsTab({ accountId, campaignId }: ProductsTabProps) {
  const { data: productsData, isLoading: productsLoading } = useProducts(accountId, campaignId);
  const { data: groupsData, isLoading: groupsLoading } = useProductGroups(accountId, campaignId);

  const products = productsData?.products ?? [];
  const productGroups = groupsData?.product_groups ?? [];

  // Calculate summary stats
  const totalProducts = products.length;
  const totalRevenue = products.reduce((sum, p) => sum + p.conversions_value, 0);
  const totalConversions = products.reduce((sum, p) => sum + p.conversions, 0);
  const topProduct = products.length > 0 ? products[0] : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Products</span>
            </div>
            <p className="text-2xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(microsToDollars(totalRevenue))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Conversions</span>
            </div>
            <p className="text-2xl font-bold">{totalConversions.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Top Product</span>
            </div>
            <p className="text-sm font-medium truncate">
              {topProduct?.product_title ?? "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Groups</CardTitle>
          <CardDescription>How your products are organized for targeting</CardDescription>
        </CardHeader>
        <CardContent>
          {groupsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : productGroups.length > 0 ? (
            <ProductGroupsSection productGroups={productGroups} />
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No product groups configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Product groups will appear for Shopping or Retail PMax campaigns
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Performance</CardTitle>
          <CardDescription>Performance metrics for individual products</CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : products.length > 0 ? (
            <ProductsTable products={products} />
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No product data available</p>
              <p className="text-xs text-muted-foreground mt-1">
                Product performance will appear for campaigns linked to a Merchant Center feed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
