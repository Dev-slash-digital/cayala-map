declare module 'qrcode' {
    function toDataURL(data: string, options?: any): Promise<string>;
    export { toDataURL };
  }
