import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
    onDetected: (code: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
    const scannerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!scannerRef.current) return;

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerRef.current,
                constraints: {
                    facingMode: "environment" // Use back camera on phones
                },
            },
            locator: {
                patchSize: "medium",
                halfSample: true,
            },
            numOfWorkers: 2,
            decoder: {
                readers: ["ean_reader", "code_128_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
            },
            locate: true
        }, (err: any) => {
            if (err) {
                console.error("Quagga initialization failed:", err);
                setError('Failed to initialize camera. Please ensure camera permissions are granted.');
                return;
            }
            Quagga.start();
        });

        const handleDetected = (data: any) => {
            if (data && data.codeResult && data.codeResult.code) {
                onDetected(data.codeResult.code);
            }
        };

        Quagga.onDetected(handleDetected);

        return () => {
            Quagga.offDetected(handleDetected); // Clean up listener clearly
            Quagga.stop();
        };
    }, [onDetected]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative w-full max-w-lg bg-white rounded-lg overflow-hidden shadow-xl mx-4">
                <div className="p-4 bg-gray-100 flex justify-between items-center border-b">
                    <h3 className="font-semibold text-lg text-gray-800">Scan Product</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                <div className="relative bg-black h-64 sm:h-80 flex items-center justify-center overflow-hidden">
                    {error ? (
                        <div className="text-white text-center p-4">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div ref={scannerRef} className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />
                            {/* Overlay guide */}
                            <div className="absolute inset-0 border-2 border-red-500 opacity-50 m-8 sm:m-12 pointer-events-none rounded-lg"></div>
                            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black bg-opacity-50 py-1">
                                Point camera at barcode
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
