import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import Modal from "../ui/Modal";

const TYPE_LABELS = {
  IMPORT: "Nhập kho",
  EXPORT: "Xuất kho",
  ADJUST: "Điều chỉnh (kiểm kê)",
};

export default function InventoryTransactionModal({
  open,
  onClose,
  onSubmit,
  submitting,
  products,
}) {
  const [type, setType] = useState("IMPORT");
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [newStock, setNewStock] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setType("IMPORT");
      setSearch("");
      setProductId("");
      setQuantity("");
      setNewStock("");
      setNote("");
    }
  }, [open]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 20);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [products, search]);

  const selectedProduct = products.find((p) => p.id === Number(productId));

  function handleSubmit() {
    if (!productId) return;

    const payload = {
      productId: Number(productId),
      type,
      note: note.trim() || null,
    };

    if (type === "ADJUST") {
      if (newStock === "") return;
      payload.newStock = Number(newStock);
    } else {
      if (!quantity || Number(quantity) <= 0) return;
      payload.quantity = Number(quantity);
    }

    onSubmit(payload);
  }

  const isValid =
    productId &&
    (type === "ADJUST" ? newStock !== "" : quantity && Number(quantity) > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo giao dịch kho"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !isValid}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Xác nhận
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Loại giao dịch
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  type === key
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Sản phẩm <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc SKU..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200">
            {filteredProducts.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">
                Không tìm thấy sản phẩm
              </p>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProductId(String(p.id))}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                    Number(productId) === p.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <span className="truncate">
                    {p.name} <span className="text-slate-400">({p.sku})</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    Tồn: {p.stock} {p.unit}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedProduct && (
          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
            Đang chọn:{" "}
            <span className="font-medium text-slate-800">
              {selectedProduct.name}
            </span>{" "}
            — Tồn kho hiện tại:{" "}
            <span className="font-medium text-slate-800">
              {selectedProduct.stock} {selectedProduct.unit}
            </span>
          </div>
        )}

        {type === "ADJUST" ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số lượng thực tế kiểm kê <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="mt-1 text-xs text-slate-400">
              Hệ thống sẽ tự tính chênh lệch so với tồn kho hiện tại.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số lượng {type === "IMPORT" ? "nhập" : "xuất"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ghi chú
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Không bắt buộc"
            className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>
    </Modal>
  );
}
