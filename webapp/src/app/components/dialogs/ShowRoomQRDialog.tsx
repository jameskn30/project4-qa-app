import { useQRCode } from 'next-qrcode';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ShowRoomQRDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    urlToEncode: string;
    title?: string;
}

const ShowRoomQRDialog = ({open, setOpen, urlToEncode, title = "Room QR Code" }: ShowRoomQRDialogProps) => {
    const { Canvas } = useQRCode();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center p-4">
                    <Canvas
                        text={urlToEncode}
                        options={{
                            errorCorrectionLevel: 'M',
                            margin: 3,
                            scale: 4,
                            width: 200,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF',
                            },
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShowRoomQRDialog;