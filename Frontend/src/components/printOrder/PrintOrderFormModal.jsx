import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import {
  SERVICE_TYPE_LABELS,
  COLOR_MODE_LABELS,
  PAPER_SIZES,
} from "../../constants/printOrder";

function emptyItem() {
  return {
    id: Math.random().toString(36).slice(2),
    description: "",
    quantity: 1,
    unitPrice: "",
  };
}

export default function PrintOrderFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  currentShift,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceType, setServiceType] = useState("PRINT_BLACK_WHITE");
  const [paperSize, setPaperSize] = useState("A4");
  const [colorMode, setColorMode] = useState("BLACK_WHITE");
  const [numberOfPages, setNumberOfPages] = useState("1");
  const [numberOfCopies, setNumberOfCopies] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      setCustomerName("");
      setCustomerPhone("");
      setServiceType("PRINT_BLACK_WHITE");
      setPaperSize("A4");
      setColorMode("BLACK_WHITE");
      setNumberOfPages("1");
      setNumberOfCopies("1");
      setUnitPrice("");
      setNote("");
      setItems([]);
    }
  }, [open]);

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function updateItem(id, field, value) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const mainTotal =
    (Number(numberOfPages) || 0) *
    (Number(numberOfCopies) || 0) *
    (Number(unitPrice) || 0);
  const itemsTotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );
  const grandTotal = mainTotal + itemsTotal;

  const isValid =
    serviceType &&
    unitPrice !== "" &&
    Number(unitPrice) >= 0 &&
    items.every((it) => it.description.trim() && Number(it.quantity) > 0);

  function handleSubmit() {
    if (!isValid) return;

    const payload = {
      customerName: customerName.trim() || null,
      customerPhone: customerPhone.trim() || null,
      serviceType,
      paperSize: paperSize || null,
      colorMode,
      numberOfPages: Number(numberOfPages) || 1,
      numberOfCopies: Number(numberOfCopies) || 1,
      unitPrice: Number(unitPrice) || 0,
      shiftId: currentShift?.id || null,
      note: note.trim() || null,
      items: items.map((it) => ({
        description: it.description.trim(),
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice) || 0,
      })),
    };

    onSubmit(payload);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo đơn dịch vụ"
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
            Tạo đơn
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {!currentShift && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-700">
            Chưa có ca làm việc đang mở — đơn vẫn tạo được nhưng sẽ không gắn
            vào ca nào.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tên khách hàng
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Không bắt buộc"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số điện thoại
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Không bắt buộc"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Dịch vụ chính
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Loại dịch vụ <span className="text-red-500">*</span>
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Khổ giấy
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {PAPER_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Chế độ màu
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {Object.entries(COLOR_MODE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Số trang
              </label>
              <input
                type="number"
                min={1}
                value={numberOfPages}
                onChange={(e) => setNumberOfPages(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Số bản
              </label>
              <input
                type="number"
                min={1}
                value={numberOfCopies}
                onChange={(e) => setNumberOfCopies(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Đơn giá <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <p className="mt-2 text-right text-sm text-slate-500">
            Thành tiền dịch vụ chính:{" "}
            <span className="font-semibold text-slate-800">
              {mainTotal.toLocaleString("vi-VN")}đ
            </span>
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Dịch vụ phụ (nếu có)
            </p>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              <Plus size={14} /> Thêm dòng
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có dịch vụ phụ nào</p>
          ) : (
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) =>
                      updateItem(it.id, "description", e.target.value)
                    }
                    placeholder="Mô tả dịch vụ"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <input
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      updateItem(it.id, "quantity", e.target.value)
                    }
                    placeholder="SL"
                    className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <input
                    type="number"
                    min={0}
                    value={it.unitPrice}
                    onChange={(e) =>
                      updateItem(it.id, "unitPrice", e.target.value)
                    }
                    placeholder="Đơn giá"
                    className="w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="shrink-0 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
          <span>Tổng cộng</span>
          <span className="text-emerald-600">
            {grandTotal.toLocaleString("vi-VN")}đ
          </span>
        </div>
      </div>
    </Modal>
  );
}
