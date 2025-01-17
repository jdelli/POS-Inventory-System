import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

const BarcodeScanner: React.FC = () => {
    const [barcode, setBarcode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!scannerRef.current) return;

        Quagga.init(
            {
                inputStream: {
                    type: 'LiveStream',
                    target: scannerRef.current,
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: 'environment', // Use the back camera
                    },
                },
                decoder: {
                    readers: ['code_128_reader', 'ean_reader', 'upc_reader'],
                },
            },
            (err: Error | null) => {
                if (err) {
                    console.error('Quagga initialization failed:', err);
                    setError('Failed to initialize the barcode scanner.');
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected((data: { codeResult?: { code?: string } }) => {
            if (data?.codeResult?.code) {
                setBarcode(data.codeResult.code);
                Quagga.stop();
            }
        });

        return () => {
            Quagga.stop();
        };
    }, []);

    return (
        <div className="barcode-scanner-container">
            <div
                ref={scannerRef}
                style={{ width: '100%', height: 'auto', border: '1px solid #ccc' }}
            ></div>

            {barcode && (
                <div className="barcode-result">
                    <h3>Scanned Barcode:</h3>
                    <p>{barcode}</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;
