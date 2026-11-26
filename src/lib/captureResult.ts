import html2canvas from 'html2canvas-pro';

export async function captureResult(element: HTMLElement): Promise<File> {
  const scale = 2;
  const screenshot = await html2canvas(element, {
    backgroundColor: '#0D111A',
    scale,
    useCORS: true,
    imageTimeout: 1500,
    logging: false,
    onclone: (_document, result) => {
      result.style.padding = '16px';
      result.style.backgroundColor = '#0D111A';
    },
  });

  const headerHeight = 64 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = screenshot.width;
  canvas.height = screenshot.height + headerHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not render result screenshot');

  context.fillStyle = '#0D111A';
  context.fillRect(0, 0, canvas.width, headerHeight);
  context.fillStyle = '#D6F36B';
  context.font = `700 ${28 * scale}px monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('qalamtype.uz', canvas.width / 2, headerHeight / 2, canvas.width - 32 * scale);
  context.drawImage(screenshot, 0, headerHeight);

  const png = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Could not encode result screenshot'));
    }, 'image/png');
  });
  return new File([png], 'qalamtype-result.png', { type: 'image/png' });
}
