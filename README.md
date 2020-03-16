This webapp can pull the chords / lyrics from ultimate-guitar.com and create a pdf from it.

--- 

features:
- load songs from ultimate-guitar.com & view the chords
- transpose chords
- simplify chords
- select parsing style (normal / northern european / southern european)
- generate pdf

---

screenshots:

![Screenshot Smartphone](/doc/screenshot_mobile.png)
![Screenshot PC](/doc/screenshot_pc.png)

---

Run `yarn build` to build the app, then just serve the build folder.

(with https://www.npmjs.com/package/serve for example, or any other webhost)

---

or run it with docker

`docker build -t ugrip --build-arg CORS_HOST=0.0.0.0 --build-arg CORS_PORT=5001 .`

`docker run -p 5000:5000 -p 5001:5001 ugrip`