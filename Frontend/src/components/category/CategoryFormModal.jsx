import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  submitting,
  category, // null = tạo mới, object = chỉnh sửa
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    if (open) {
      setName(category?.name || "");
      setDescription(category?.description || "");
      setStatus(category?.status || "ACTIVE");
    }
  }, [open, category]);

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
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
            disabled={submitting || !name.trim()}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {category ? "Lưu thay đổi" : "Tạo danh mục"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Đồ uống"
            autoFocus
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả ngắn về danh mục (không bắt buộc)"
            className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {category && (
          <div>
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
      </div>
    </Modal>
  );
}
