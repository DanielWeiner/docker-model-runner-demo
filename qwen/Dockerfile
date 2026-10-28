FROM alpine:latest
RUN apk add --no-cache curl bash nodejs npm
ENV GOOSE_BIN_DIR=/usr/bin
ENV HOME=/root
ENV PATH="$HOME/.local/bin:$HOME/.local/lib:$PATH"
RUN curl -fsSLO https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.sh
RUN chmod +x install-qwen-standalone.sh
RUN ./install-qwen-standalone.sh --source npm --method npm
COPY settings.json $HOME/.qwen/settings.json
COPY run.sh $HOME/run.sh
RUN chmod +x $HOME/run.sh
ENV MAIN_LLM_NAME=
WORKDIR $HOME
ENTRYPOINT [ "/root/run.sh" ]