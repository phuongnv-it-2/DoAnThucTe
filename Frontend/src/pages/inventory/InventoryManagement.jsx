import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { inventoryApi } from "../../services/inventoryApi";
import { productApi } from "../../services/productApi";
import { useToast } from "../../contexts/ToastContext";
import PageHeader from "../../components/ui/PageHeader";
import InventoryHistoryTable from "../../components/inventory/InventoryHistoryTable";
import InventoryTransactionModal from "../../components/inventory/InventoryTransactionModal";

export default function InventoryManagement() {
  const toast = useToast();

  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  async function loadData(filters = {}) {
    setLoading(true);
    try {
      const [txRes, productsRes] = await Promise.all([
        inventoryApi.getAll(filters),
        productApi.getAll({ status: "ACTIVE" }),
      ]);
      setTransactions(txRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải dữ liệu kho hàng"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(type) {
    setTypeFilter(type);
    loadData(type ? { type } : {});
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      await inventoryApi.create(payload);
      toast.success("Ghi nhận giao dịch kho thành công");
      setFormVisible(false);
      await loadData(typeFilter ? { type: typeFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Ghi nhận giao dịch thất bại");
    } finally {
      setSubmitting(false);
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
        title="Kho hàng"
        subtitle="Lịch sử nhập / xuất / điều chỉnh tồn kho"
        action={
          <button
            onClick={() => setFormVisible(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <Plus size={16} /> Tạo giao dịch
          </button>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "", label: "Tất cả" },
          { value: "IMPORT", label: "Nhập kho" },
          { value: "EXPORT", label: "Xuất kho" },
          { value: "ADJUST", label: "Điều chỉnh" },
          { value: "SALE", label: "Bán hàng" },
          { value: "CANCEL_SALE", label: "Hủy bán" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleFilterChange(opt.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              typeFilter === opt.value
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <InventoryHistoryTable transactions={transactions} />

      <InventoryTransactionModal
        open={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        products={products}
      />
    </div>
  );
}
