// Điền thông tin tài khoản nhận tiền thật của cửa hàng
export const STORE_BANK = {
    bankId: "MB",              // mã ngân hàng: MB, VCB, TCB, ACB, BIDV, VPB, TPB, VIB, CTG, AGR...
    bankName: "MB Bank",
    accountNumber: "0123456789",
    accountName: "NGUYEN VAN A", // viết hoa, không dấu
};

// Nếu muốn dùng 1 ảnh QR tĩnh của ngân hàng (không kèm số tiền),
// đặt file vào Frontend/public/qr-shop.png rồi điền "/qr-shop.png". Để "" nếu dùng QR tự tạo.
export const STATIC_QR_IMAGE = "";

export function buildQrUrl({ amount, content }) {
    const { bankId, accountNumber, accountName } = STORE_BANK;
    const params = new URLSearchParams({
        amount: String(Math.round(amount)),
        addInfo: content,
        accountName,
    });
    return `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?${params.toString()}`;
}