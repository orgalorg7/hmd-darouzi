# Rebuilds public/assets/products/ from the company profile PDF. Requires poppler-utils, ImageMagick and Pillow.
# Each product uses the PDF's own soft mask, so cut-outs follow the original outlines rather than guessed backgrounds.
import os,subprocess,tempfile
from PIL import Image,ImageDraw,ImageFilter
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf=os.path.join(root,'hmd darouzi .Profile 2025.pdf');out=os.path.join(root,'public/assets/products')
# Page-image identifiers from `pdfimages -list`; each image's soft mask is the next number.
sources={'compressor':'004-109','condensing':'004-105','evaporator':'002-023','panels':'005-155','truck-unit':'007-207','truck':'007-195','hardware':'007-211'}
# The profile has no cold-room door; this company photograph (see build-site-photos.py) is traced along the room's straight edges.
photos={'door':('source-photos/facebook/cold-room-hinged-door.jpg',[(152,358),(1294,154),(1294,1594),(192,1380),(150,1362)])}
# One canvas for every card. Upscaling is capped so low-resolution originals stay sharp instead of filling the card.
W,H=650,536;FIT_W,FIT_H=W*.9,H*.84;CAP=1.35
os.makedirs(out,exist_ok=True)
def publish(name,im,label):
    scale=min(FIT_W/im.width,FIT_H/im.height,CAP)
    im=im.resize((round(im.width*scale),round(im.height*scale)),Image.LANCZOS)
    if scale>1:im=im.filter(ImageFilter.UnsharpMask(radius=1.2,percent=60,threshold=2))
    canvas=Image.new('RGBA',(W,H),(0,0,0,0));canvas.alpha_composite(im,((W-im.width)//2,(H-im.height)//2))
    canvas.save(f'{out}/{name}.webp',quality=88,method=6)
    canvas.resize((300,round(H*300/W)),Image.LANCZOS).save(f'{out}/{name}-small.webp',quality=86,method=6)
    print(f'{name}: {label}, scale {scale:.2f}')
with tempfile.TemporaryDirectory() as work:
    subprocess.run(['pdfimages','-all','-p',pdf,f'{work}/img'],check=True)
    find=lambda ident:next(f'{work}/{f}' for f in os.listdir(work) if f.startswith(f'img-{ident}.'))
    for name,ident in sources.items():
        page,num=ident.split('-');img,mask=find(ident),find(f'{page}-{int(num)+1:03d}');cut=f'{work}/{name}.png'
        # CMYK JPEGs in this PDF are stored inverted.
        subprocess.run(['magick',img,*(['-negate'] if img.endswith('.jpg') else []),'-colorspace','sRGB','(',mask,'-colorspace','gray',')','-alpha','off','-compose','CopyOpacity','-composite',cut],check=True)
        im=Image.open(cut).convert('RGBA');alpha=im.getchannel('A').point(lambda v:0 if v<12 else v);im.putalpha(alpha);publish(name,im.crop(alpha.getbbox()),ident)
for name,(path,outline) in photos.items():
    im=Image.open(os.path.join(root,path)).convert('RGBA');mask=Image.new('L',im.size,0);ImageDraw.Draw(mask).polygon(outline,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(1.2));im.putalpha(mask);publish(name,im.crop(mask.getbbox()),path)
