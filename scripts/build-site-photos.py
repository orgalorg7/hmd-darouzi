# Builds web images for the "Our work" section and two service tabs from source-photos/facebook/.
# Sources are the company's own Facebook page (facebook.com/profile.php?id=61586906683380), saved at the
# largest size Facebook serves. Photo ids are kept for provenance. Requires Pillow.
import os
from PIL import Image,ImageOps
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src=os.path.join(root,'source-photos/facebook');assets=os.path.join(root,'public/assets')
# cold-room-hinged-door.jpg (fbid 122117312601230222) is used only by build-product-images.py.
# One upload batch of 16 photos accompanies the post "من اعمال الشركه براد 4800 طن"; these five are from it.
projects={
 'cold-store-4800-corridor':'122114963919230222','cold-store-4800-condensing-row':'122114964219230222',
 'cold-store-4800-rooftop':'122114963841230222','cold-store-4800-evaporators':'122114963871230222',
 'cold-store-4800-sliding-door':'122114963709230222',
 'rooftop-chillers':'122111713779230222','cooling-towers':'122109886491230222','condensing-unit-site':'122115251319230222',
 'workshop-condensing-units':'122117313345230222','workshop-compressor-racks':'122117313759230222','cold-room-installation':'122117313075230222'}
def save(im,path,width,quality):
    im=im.copy();im.thumbnail((width,width*4),Image.LANCZOS);im.save(path,quality=quality,method=6)
os.makedirs(f'{assets}/projects',exist_ok=True)
for name in projects:
    im=ImageOps.exif_transpose(Image.open(f'{src}/{name}.jpg')).convert('RGB')
    # Never upscale: a photo is published at most at the size Facebook provided.
    save(im,f'{assets}/projects/{name}.webp',min(im.width,1200),80)
    save(im,f'{assets}/projects/{name}-small.webp',min(im.width,600),78)
    print(f'{name}: {im.size}')
# Service tabs and guide pages use 4:3 photographs of real installations.
for service,name in {'service-chillers':'rooftop-chillers','service-towers':'cooling-towers'}.items():
    im=ImageOps.fit(Image.open(f'{src}/{name}.jpg').convert('RGB'),(1040,780),Image.LANCZOS,centering=(.5,.55))
    im.save(f'{assets}/{service}.webp',quality=80,method=6);print(f'{service}: from {name}')
