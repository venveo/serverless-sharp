.PHONY: buildsharplayer
SHELL = /bin/sh

buildsharplayer:
	docker build -t sharp-layer --platform=linux/amd64 ./lambdaLayers/SharpLayer
	docker run \
	 	--platform=linux/amd64 \
		-v `pwd`/lambdaLayers/SharpLayer:/app \
		--name sharp-layer --rm sharp-layer