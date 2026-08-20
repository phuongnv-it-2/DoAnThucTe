import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Ban,
  CheckCircle2,
  Search,
  ImageOff,
  AlertTriangle,
} from "lucide-react";
import { productApi } from "../../services/productApi";
import { categoryApi } from "../../services/categoryApi";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import ProductFormModal from "../../components/product/ProductFormModal";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductManagement() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [formVisible, setFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll({ status: "ACTIVE" }),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải dữ liệu sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory =
        !categoryFilter || p.categoryId === Number(categoryFilter);
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  function openCreate() {
    setEditingProduct(null);
    setFormVisible(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setFormVisible(true);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await productApi.create(payload);
        toast.success("Tạo sản phẩm thành công");
      }
      setFormVisible(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(product) {
    if (product.status === "ACTIVE") {
      // remove() -> đặt INACTIVE (soft-delete)
      try {
        await productApi.remove(product.id);
        toast.success("Đã vô hiệu hóa sản phẩm");
        await loadData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Thao tác thất bại");
      }
    } else {
      try {
        await productApi.update(product.id, { status: "ACTIVE" });
        toast.success("Đã kích hoạt sản phẩm");
        await loadData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Thao tác thất bại");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        subtitle="Quản lý danh sách sản phẩm"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, SKU, mã vạch..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:w-56"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <ImageOff size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">
            Không tìm thấy sản phẩm phù hợp
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá bán</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const lowStock = p.stock <= p.minStock;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff size={16} className="text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          lowStock ? "text-orange-600" : "text-slate-700"
                        }`}
                      >
                        {lowStock && <AlertTriangle size={13} />}
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-slate-400 hover:text-emerald-600"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={
                            p.status === "ACTIVE"
                              ? "text-slate-400 hover:text-red-500"
                              : "text-slate-400 hover:text-emerald-600"
                          }
                          title={
                            p.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"
                          }
                        >
                          {p.status === "ACTIVE" ? (
                            <Ban size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        open={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
}
