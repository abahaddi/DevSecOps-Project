FROM golang:1.26.3-alpine AS build

WORKDIR /src
COPY . .

RUN apk add --no-cache git ca-certificates
RUN go build -o /go-server

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=build /go-server /go-server
EXPOSE 8080
CMD ["/go-server"]
