export const imageProcessor = {
  // Compress image
  compressImage: (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type,
            quality
          );
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  },
  
  // Get image dimensions
  getImageDimensions: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height
          });
        };
        
        img.onerror = (error) => {
          reject(error);
        };
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  },
  
  // Convert to base64
  toBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        resolve(reader.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
    });
  },
  
  // Validate image
  validateImage: (file, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
    const errors = [];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      errors.push(`File size must be less than ${maxSizeMB}MB.`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Create image thumbnail
  createThumbnail: async (file, size = 200) => {
    const compressed = await imageProcessor.compressImage(file, size, size, 0.7);
    return URL.createObjectURL(compressed);
  }
};