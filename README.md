# Send REST API Request

## Inputs

### `url`

**Required** The URL to send the request to.

### `method`

**Required** The HTTP method to use (GET, POST, PUT, DELETE).

### `headers`

**Optional** The headers to include in the request.

### `body`

**Optional** The body of the request.

### `attachment-dir`

**Optional** If there are any attachments to attach to the request. This can also be a file path.

## Outputs

### `response`

The response from the API.

## Supported HTTP Methods

This action supports the following HTTP methods:

- `GET`
- `POST`
- `PUT`
- `DELETE`

## Building the distribution

The distribution must be built and committed before using.

```bash
ncc build index.js --license licenses.txt
```

## Example usage

```yaml
- name: Send REST API request
  id: send-api-request
  uses: abrarhayat/req-js-action@master
  with:
    url: 'https://api.example.com/resource'
    method: 'POST'
    headers: 
    '
    {
      "Content-Type": "application/json",
      Authorization: Bearer ${{ secrets.BEARER_TOKEN }}
    }
    '
    body: '{"key": "value"}
    '
```

## Testing Locally

If you're testing the script locally, make sure to create an `.env` file with the required inputs:

```sh
URL=https://api.example.com/resource
METHOD=POST
HEADERS={
  "Content-Type": "application/json",
  Authorization: Bearer ${{ secrets.BEARER_TOKEN }}}
BODY={"key": "value"}
```

## Run script

```bash
node --env-file=.env package-access.js
```
