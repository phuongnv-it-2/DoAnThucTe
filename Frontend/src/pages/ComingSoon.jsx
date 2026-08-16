import { Construction } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";

export default function ComingSoon({ title }) {
  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Trang này sẽ được xây dựng ở phase tiếp theo."
      />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Construction size={26} />
        </div>
        <p className="text-sm font-medium text-slate-600">Đang phát triển</p>
        <p className="mt-1 text-sm text-slate-400">
          Chức năng "{title}" sẽ sớm được kết nối với API.
        </p>
      </div>
    </div>
  );
}
