# notes

## database scheme

### point

| Attribute | Type | Note        |
| --------- | ---- | ----------- |
| `not_id`  | id   | Primary key |
| `x`       | f64  |             |
| `y`       | f64  |             |
| `quad`    | id   | Indexed     |
| `index`   | int  |             |
| `layer`   | id   |             |

### layer

| Attribute | Type | Note |
| --------- | ---- | ---- |
| `not_id`  | id   |      |
| `style`   | json |      |

### quad

| Attribute | Type | Note                  |
| --------- | ---- | --------------------- |
| `not_id`  | id   | Primary key, root = 0 |
| `tl`      | id?  |                       |
| `tr`      | id?  |                       |
| `bl`      | id?  |                       |
| `tr`      | id?  |                       |
