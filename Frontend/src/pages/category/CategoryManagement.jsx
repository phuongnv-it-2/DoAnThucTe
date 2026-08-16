import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Ban, CheckCircle2, Tags } from "lucide-react";
import { categoryApi } from "../../services/categoryApi";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import CategoryFormModal from "../../components/category/CategoryFormModal";

export default function CategoryManagement() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditingCategory(null);
    setFormVisible(true);
  }

  function openEdit(category) {
    setEditingCategory(category);
    setFormVisible(true);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, payload);
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryApi.create(payload);
        toast.success("Tạo danh mục thành công");
      }
      setFormVisible(false);
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(category) {
    const nextStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await categoryApi.update(category.id, { status: nextStatus });
      toast.success(
        nextStatus === "ACTIVE"
          ? "Đã kích hoạt danh mục"
          : "Đã vô hiệu hóa danh mục"
      );
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
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
        title="Danh mục"
        subtitle="Quản lý danh mục sản phẩm"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Plus size={16} /> Thêm danh mục
          </button>
        }
      />

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Tags size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">Chưa có danh mục nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Tên danh mục</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-500">
                    {c.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-slate-400 hover:text-emerald-600"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={
                          c.status === "ACTIVE"
                            ? "text-slate-400 hover:text-red-500"
                            : "text-slate-400 hover:text-emerald-600"
                        }
                        title={
                          c.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"
                        }
                      >
                        {c.status === "ACTIVE" ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormModal
        open={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        category={editingCategory}
      />
    </div>
  );
}
