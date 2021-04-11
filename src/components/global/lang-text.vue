<script>
    import GetLang from "@Services/Language";

    export default {
        props: {
            'tagName': {
                type: String,
                default: 'span'
            },
            'langId': {
                type: String,
                required: true
            }
        },
        render(createElement){
            return createElement(this.tagName, {
                domProps: {
                    innerHTML: GetLang(this.langId)
                }
            });
        }
    };
</script>