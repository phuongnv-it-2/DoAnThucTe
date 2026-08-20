import { useEffect, useState } from "react";
import { Loader2, ImageOff, Upload } from "lucide-react";
import Modal from "../ui/Modal";
import { uploadApi } from "../../services/uploadApi";
import { useToast } from "../../contexts/ToastContext";

const UNITS = ["cái", "chai", "lon", "gói", "hộp", "kg", "thùng", "tờ"];

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  product, // null = tạo mới, object = chỉnh sửa
  categories,
}) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("5");
  const [unit, setUnit] = useState("cái");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(product?.name || "");
      setSku(product?.sku || "");
      setBarcode(product?.barcode || "");
      setCategoryId(product?.categoryId || categories[0]?.id || "");
      setCostPrice(product?.costPrice ?? "");
      setSellingPrice(product?.sellingPrice ?? "");
      setStock(product ? String(product.stock) : "0");
      setMinStock(product ? String(product.minStock) : "5");
      setUnit(product?.unit || "cái");
      setDescription(product?.description || "");
      setImage(product?.image || "");
      setStatus(product?.status || "ACTIVE");
    }
  }, [open, product, categories]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setImage(res.data.data.url);
      toast.success("Tải ảnh lên thành công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit() {
    if (!name.trim() || !sku.trim() || !categoryId) return;

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      barcode: barcode.trim() || null,
      categoryId: Number(categoryId),
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      minStock: Number(minStock) || 0,
      unit,
      description: description.trim() || null,
      image: image || null,
    };

    if (!product) {
      payload.stock = Number(stock) || 0;
    } else {
      payload.status = status;
    }

    onSubmit(payload);
  }

  const isValid = name.trim() && sku.trim() && categoryId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
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
            disabled={submitting || !isValid || uploading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {product ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Ảnh sản phẩm */}
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ảnh sản phẩm
          </label>
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-slate-400" />
            ) : image ? (
              <img
                src={image}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageOff size={28} className="text-slate-300" />
            )}
            <label className="absolute bottom-1.5 right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-md hover:bg-slate-100">
              <Upload size={14} />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Thông tin cơ bản */}
        <div className="space-y-4 sm:col-span-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Coca-Cola lon 330ml"
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SP001"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Mã vạch
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Không bắt buộc"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Đơn vị
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Giá vốn
          </label>
          <input
            type="number"
            min={0}
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Giá bán
          </label>
          <input
            type="number"
            min={0}
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {product ? "Tồn kho" : "Tồn kho ban đầu"}
          </label>
          <input
            type="number"
            min={0}
            value={stock}
            disabled={!!product}
            onChange={(e) => setStock(e.target.value)}
            title={product ? "Sửa tồn kho qua trang Kho hàng" : ""}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Ngưỡng cảnh báo
          </label>
          <input
            type="number"
            min={0}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {product && (
        <p className="mt-1.5 text-xs text-slate-400">
          Muốn thay đổi tồn kho? Vào trang{" "}
          <span className="font-medium">Kho hàng</span> để nhập/xuất/điều chỉnh
          (giữ lịch sử giao dịch).
        </p>
      )}

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Mô tả
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Không bắt buộc"
          className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {product && (
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Trạng thái
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["ACTIVE", "INACTIVE"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                  status === s
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s === "ACTIVE" ? "Hoạt động" : "Ngừng"}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
