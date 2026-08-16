import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Banknote,
  CreditCard,
  Loader2,
} from "lucide-react";
import { productApi } from "../../services/productApi";
import { categoryApi } from "../../services/categoryApi";
import { invoiceApi } from "../../services/invoiceApi";
import { shiftApi } from "../../services/shiftApi";
import { useToast } from "../../contexts/ToastContext";
import ProductCard from "../../components/pos/ProductCard";
import CategoryTabs from "../../components/pos/CategoryTabs";
import CartLine from "../../components/pos/CartLine";
import ReceiptModal from "../../components/pos/ReceiptModal";
import { formatCurrency } from "../../utils/formatCurrency";

export default function POS() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const [cart, setCart] = useState([]); // { productId, name, sku, unit, unitPrice, quantity, stock }
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [currentShift, setCurrentShift] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // ---------------------------------------------------------------- load
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, shiftRes] = await Promise.all([
          productApi.getAll({ status: "ACTIVE" }),
          categoryApi.getAll({ status: "ACTIVE" }),
          shiftApi.getCurrent().catch(() => ({ data: { data: null } })),
        ]);
        setProducts(productsRes.data.data);
        setCategories(categoriesRes.data.data);
        setCurrentShift(shiftRes.data.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Không thể tải dữ liệu sản phẩm"
        );
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------- filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === null || p.categoryId === activeCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  // --------------------------------------------------------------- cart
  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`"${product.name}" không đủ tồn kho`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          unitPrice: Number(product.sellingPrice),
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function updateQty(productId, qty) {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(qty, i.stock) }
          : i
      );
    });
  }

  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setCart([]);
    setDiscount(0);
  }

  // ------------------------------------------------------------- totals
  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const total = Math.max(0, subtotal - Number(discount || 0));

  // ----------------------------------------------------------- checkout
  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }
    if (!currentShift) {
      toast.error(
        "Chưa có ca làm việc đang mở. Vui lòng bắt đầu ca trước khi bán hàng."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shiftId: currentShift.id,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        discount: Number(discount || 0),
        paymentMethod,
      };

      const res = await invoiceApi.create(payload);
      const invoice = res.data.data;

      toast.success(`Tạo hóa đơn ${invoice.invoiceCode} thành công`);
      setReceiptInvoice(invoice);
      clearCart();

      // Refresh product stock after a successful sale
      const productsRes = await productApi.getAll({ status: "ACTIVE" });
      setProducts(productsRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo hóa đơn thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 lg:flex-row">
      {/* ------------------------------- LEFT: catalog ------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex flex-col gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm theo tên, SKU, mã vạch..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <CategoryTabs
            categories={categories}
            activeId={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-slate-400">
              <ShoppingCart size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Không tìm thấy sản phẩm phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------- RIGHT: cart -------------------------------- */}
      <div className="flex w-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:w-96">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ShoppingCart size={17} /> Giỏ hàng ({cart.length})
          </h3>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-slate-400 hover:text-red-500"
            >
              Xóa tất cả
            </button>
          )}
          {!currentShift && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600">
              Chưa mở ca
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-slate-400">
              <ShoppingCart size={28} className="mb-2 opacity-40" />
              <p className="text-sm">Chưa có sản phẩm nào</p>
              <p className="text-xs">Chọn sản phẩm bên trái để thêm vào giỏ</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                onQtyChange={updateQty}
                onRemove={removeFromCart}
              />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-500">
                <span>Giảm giá</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 rounded-md border border-slate-200 px-2 py-1 text-right text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-emerald-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod("CASH")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  paymentMethod === "CASH"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Banknote size={16} /> Tiền mặt
              </button>
              <button
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  paymentMethod === "TRANSFER"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <CreditCard size={16} /> Chuyển khoản
              </button>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting
                ? "Đang xử lý..."
                : `Thanh toán · ${formatCurrency(total)}`}
            </button>
          </div>
        )}
      </div>

      {receiptInvoice && (
        <ReceiptModal
          invoice={receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
        />
      )}
    </div>
  );
}
