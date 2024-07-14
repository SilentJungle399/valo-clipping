
import torch
from torch import nn
from torchvision import transforms
import socketio
from aiohttp import web
import io, base64
import cv2

sio = socketio.AsyncServer(async_mode='aiohttp', cors_allowed_origins='*')

app = web.Application()
sio.attach(app)

def get_one_hot(*args):
  classes = 2
  return nn.functional.one_hot(torch.Tensor(args).to(torch.int64), classes).to(torch.float)[0]

class KillDetect(nn.Module):
    def __init__(self):
        super(KillDetect, self).__init__()

        self.layer1 = nn.Sequential(
            nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.layer2 = nn.Sequential(
            nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2)
        )

        self.m2t_1 = nn.Linear(in_features=18 * 18 * 64, out_features=6000)
        self.drop = nn.Dropout(0.25)
        self.m2t_2 = nn.Linear(in_features=6000, out_features=600)
        self.m2t_3 = nn.Linear(in_features=600, out_features=120)
        self.m2t_4 = nn.Linear(in_features=120, out_features=2)

    def forward(self, x):
        out = self.layer1(x)
        out = self.layer2(out)
        out = out.view(out.size(0), -1)
        out = self.m2t_1(out)
        out = self.drop(out)
        out = self.m2t_2(out)
        out = self.m2t_3(out)
        out = self.m2t_4(out)

        return out

MODEL_FILE = "backend/model.pt"

model = KillDetect()
checkpoint = torch.load(MODEL_FILE, map_location = torch.device('cuda' if torch.cuda.is_available() else 'cpu'))
try:
    model.load_state_dict(checkpoint['model_state_dict'])
except:
    print("Error loading model")
else:
    print("Model loaded")

model.eval()
print(model)

totensor = transforms.ToTensor()

def solve(image):
    tensor = totensor(image)
    tensor = tensor.unsqueeze(0)
    tensor = tensor.to(torch.float32)
    
    output = model(tensor)
    output = torch.argmax(output)

    return output.item()

class VideoChunkManager:
    def __init__(self, chunk_size: int, sid: str):
        self.current_chunk = 0
        self.chunk_size = chunk_size
        self.reserve = {}

        self.sid = sid

    def clear_reserve(self):
        while self.current_chunk + 1 in self.reserve:
            # do things with self.reserve[self.current_chunk + 1]
            del self.reserve[self.current_chunk + 1]
            self.current_chunk += 1

    def write(self, data, chunk_no):
        if chunk_no != self.current_chunk + 1:
            self.reserve[chunk_no] = data
            return self.clear_reserve()
        
        # do things with data
        print('chunk_no', chunk_no)

        self.current_chunk += 1


videos = {}

@sio.on('connect')
async def connect(sid, environ):
    print('connect ', sid)

@sio.event
async def video_chunk(sid, data):
    print('upload_chunk ', sid)
    if data['name'] not in videos:
        videos[data['name']] = VideoChunkManager(data['totalChunks'])

    videos[data['name']].write(data['data'], data['chunkNumber'])

@sio.event
async def video_end(sid, data):
    print('upload_end ', sid)
    del videos[data['name']]

if __name__ == '__main__':
    web.run_app(app, port = 3003)