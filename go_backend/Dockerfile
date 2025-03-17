FROM golang:alpine AS builder

ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

WORKDIR /myapp

COPY go.mod .
# Define build-time arguments for Go cache directory
ARG CACHE_DIR=/go/cache

RUN --mount=type=cache,target=$CACHE_DIR/pkg/mod \
    --mount=type=cache,target=$CACHE_DIR/build \
    go mod download && go mod verify

COPY . .
# Build the binary
RUN go build \
    -ldflags='-w -s -extldflags "-static"' -a \
    -o /myapp/app .

# STAGE 2: image running the application
FROM alpine:latest

ARG USER=user
ARG USER_ID=1001
ARG GROUP_ID=1001

# Create a group with the specified GROUP_ID
RUN addgroup  --gid ${GROUP_ID} ${USER}
# Create a user with the specified USER_ID and assign it to the group
RUN adduser \
    --disabled-password --gecos "" \
    --home "$(pwd)" --no-create-home \
    --ingroup ${USER} \
    --uid ${USER_ID} ${USER}

# Switch to the unprivileged user
USER ${USER}

# Copy our static executable.
COPY --from=builder /myapp/app /bin/myapp

EXPOSE 8080

ENTRYPOINT ["/bin/myapp"]