import html2canvas from 'html2canvas-pro';

export async function captureResult(element: HTMLElement): Promise<File> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#0D111A',
    scale: 2,
    useCORS: true,
    imageTimeout: 1500,
    logging: false,
    onclone: (document, result) => {
      result.style.padding = '16px';
      result.style.backgroundColor = '#0D111A';

      const wordmark = document.createElement('div');
      wordmark.textContent = 'qalamtype.uz';
      wordmark.style.cssText = 'color:#D6F36B;font:700 18px monospace;margin-bottom:4px';
      result.prepend(wordmark);
    },
  });

  const png = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Could not encode result screenshot'));
    }, 'image/png');
  });
  return new File([png], 'qalamtype-result.png', { type: 'image/png' });
}
